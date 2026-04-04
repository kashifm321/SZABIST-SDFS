'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

export async function addStudent(_prevState: any, formData: FormData) {
  try {
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    const registrationNumber = formData.get('registrationNumber') as string
    const password = formData.get('password') as string

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return { error: 'Email already exists' }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        password: hashedPassword,
        registrationNumber,
        role: 'STUDENT'
      }
    })

    revalidatePath('/admin/students')
    return { success: true }
  } catch (error) {
    console.error('Error adding student:', error)
    return { error: 'Failed to add student' }
  }
}

export async function updateStudent(id: number, firstName: string, lastName: string, email: string, registrationNumber: string) {
  try {
    await prisma.user.update({
      where: { id },
      data: {
        name: `${firstName} ${lastName}`,
        email,
        registrationNumber
      }
    })

    revalidatePath('/admin/students')
    return { success: true }
  } catch (error) {
    console.error('Error updating student:', error)
    return { error: 'Failed to update student' }
  }
}

export async function deleteStudent(id: number) {
  try {
    await prisma.user.delete({
      where: { id }
    })

    revalidatePath('/admin/students')
    return { success: true }
  } catch (error) {
    console.error('Error deleting student:', error)
    return { error: 'Failed to delete student' }
  }
}

export async function getEnrolledStudents(moduleId: number) {
  try {
    const moduleWithStudents = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        enrolledStudents: {
          select: {
            id: true,
            name: true,
            email: true,
            registrationNumber: true,
            role: true
          }
        }
      }
    })

    if (!moduleWithStudents) return { success: false, error: 'Module not found' }
    
    return { 
      success: true, 
      students: moduleWithStudents.enrolledStudents.map((s: any) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        registrationNo: s.registrationNumber || 'N/A',
        role: s.role
      }))
    }
  } catch (error) {
    console.error('Error fetching students:', error)
    return { success: false, error: 'Failed to fetch students' }
  }
}

export async function enrollStudentByRegistration(
  moduleId: number, 
  registrationNumber: string,
  name?: string,
  email?: string
) {
  try {
    let student = await prisma.user.findFirst({
      where: { 
        OR: [
          { registrationNumber: registrationNumber },
          { email: email || '' }
        ]
      }
    })

    if (!student) {
      if (!name || !email) {
        return { success: false, error: 'Student not found. Please provide Name and Email to create a new account.' }
      }

      // Hash default password
      const initialPassword = 'password123'
      const hashedPassword = await bcrypt.hash(initialPassword, 10)
      
      student = await prisma.user.create({
        data: {
          registrationNumber,
          name,
          email,
          password: hashedPassword,
          role: 'STUDENT',
          mustChangePassword: true
        }
      })

      // Send email
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.ethereal.email',
          port: parseInt(process.env.SMTP_PORT || '587'),
          auth: {
            user: process.env.SMTP_USER || 'test@ethereal.email',
            pass: process.env.SMTP_PASS || 'testpass'
          }
        })

        await transporter.sendMail({
          from: process.env.SMTP_FROM || '"SZABIST SDFS" <noreply@szabist.edu.pk>',
          to: email,
          subject: 'Welcome to SZABIST Student Digital Folder System',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2 style="color: #071a4a;">Welcome to SZABIST SDFS!</h2>
              <p>Dear ${name},</p>
              <p>Your student account has been created successfully and you have been enrolled in your course.</p>
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;"><strong>Registration Number:</strong> ${registrationNumber}</p>
                <p style="margin: 0;"><strong>Login Password:</strong> ${initialPassword}</p>
              </div>
              <p>Please log in using your email and the provided password. You will be asked to change your password upon your first login.</p>
              <p>Best Regards,<br>SZABIST Administration</p>
            </div>
          `
        })
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError)
      }
    }

    await prisma.module.update({
      where: { id: moduleId },
      data: {
        enrolledStudents: {
          connect: { id: student.id }
        }
      }
    })

    revalidatePath('/admin/classes')
    return { success: true, created: !student.createdAt } // Slightly hacky way to detect new
  } catch (error) {
    console.error('Enrollment error:', error)
    return { success: false, error: 'Failed to enroll student' }
  }
}

export async function enrollStudentsBatch(moduleId: number, studentsData: any[]) {
  try {
    const results = {
      enrolled: 0,
      failed: 0,
      errors: [] as string[]
    }

    for (const data of studentsData) {
      if (!data || typeof data !== 'object') continue;

      const getVal = (possibleKeys: string[]) => {
        const key = Object.keys(data).find(k => 
          possibleKeys.some(pk => k.toLowerCase().replace(/[^a-z0-9]/g, '') === pk.toLowerCase().replace(/[^a-z0-9]/g, ''))
        );
        return key ? data[key] : null;
      }

      const regNo = getVal(['registrationno', 'registrationnumber', 'regno', 'registration', 'studentid', 'rollnumber', 'rollno', 'id']);
      const name = getVal(['name', 'fullname', 'studentname', 'student']);
      const email = getVal(['email', 'emailaddress', 'emailid', 'mail']);
      
      if (!regNo) {
        results.failed++
        results.errors.push('Missing registration number in row')
        continue
      }

      const result = await enrollStudentByRegistration(
        moduleId, 
        String(regNo), 
        name ? String(name) : undefined, 
        email ? String(email) : undefined
      );

      if (result.success) {
        results.enrolled++;
      } else {
        results.failed++;
        results.errors.push(`Row ${regNo}: ${result.error}`);
      }
    }

    revalidatePath('/admin/classes')
    return { 
      success: true, 
      count: results.enrolled,
      failed: results.failed,
      errors: results.errors 
    }
  } catch (error) {
    console.error('Batch enrollment error:', error)
    return { success: false, error: 'Failed to process batch enrollment' }
  }
}

export async function unenrollStudent(moduleId: number, studentId: number) {
  try {
    await prisma.module.update({
      where: { id: moduleId },
      data: {
        enrolledStudents: {
          disconnect: { id: studentId }
        }
      }
    })

    revalidatePath('/admin/classes')
    return { success: true }
  } catch (error) {
    console.error('Unenrollment error:', error)
    return { success: false, error: 'Failed to unenroll student' }
  }
}
