import prisma from './src/lib/prisma';

async function main() {
  try {
    console.log('Testing Module findUnique...');
    // Get the first module
    const firstModule = await prisma.module.findFirst();
    if (!firstModule) {
      console.log('No modules found in DB.');
      return;
    }
    
    console.log('Found Module ID:', firstModule.id);
    
    const moduleData = await (prisma.module as any).findUnique({
      where: { id: firstModule.id },
      select: {
        id: true,
        name: true,
        outlineName: true,
        outlineUrl: true
      }
    });
    
    console.log('Module Data:', moduleData);
    process.exit(0);
  } catch (err: any) {
    console.error('DIAGNOSTIC ERROR:', err.message);
    if (err.message.includes('outlineName')) {
      console.log('CONFIRMED: outlineName column is missing in DB.');
    }
    process.exit(1);
  }
}

main();
