import { DataTable } from '@/components/data-table'
import  data from '@/constants/data.json'

export default function ScansPage() {
  return (
    <div>
      <DataTable data={data} />
    </div>
  )
}
