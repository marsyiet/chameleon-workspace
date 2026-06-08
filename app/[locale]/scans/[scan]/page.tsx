export default async function ScansPage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string }>
}) {
  const { title } = await searchParams

  return (
    <div>
      <p>Votre scan est en cours d'exécution</p>
      <h1>{title}</h1>

      
    </div>
  )
}