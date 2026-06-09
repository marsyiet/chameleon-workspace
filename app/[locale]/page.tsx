import {getTranslations} from 'next-intl/server';
 
export default async function HomePage() {
  const t = await getTranslations('Workspace');
  return (
    <main className="h-full overflow-auto">
      <div className="h-full">
        <h1 className="px-6">{t('title')}</h1>
      </div>
    </main>
  );
}