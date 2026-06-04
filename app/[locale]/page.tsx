import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { DataTable } from '@/components/data-table';
import { SectionCards } from '@/components/section-cards';
import {getTranslations} from 'next-intl/server';
import data from "@/constants/data.json"
 
export default async function HomePage() {
  const t = await getTranslations('Workspace');
  return (
    <main className="h-full overflow-auto">
      <div className="h-full">
        <h1 className="px-6">{t('title')}</h1>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-2 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}