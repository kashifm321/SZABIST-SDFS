export const revalidate = 0;

export default async function ManageClassesPage() {
  return (
    <div className="p-10 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h2 className="text-xl font-bold text-gray-800 underline">System Diagnosis Mode</h2>
      <p className="text-gray-500 max-w-md text-sm leading-relaxed mt-2">
        If you can see this line, the Server Component and Layout are functioning correctly.
      </p>
    </div>
  );
}
