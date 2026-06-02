import {getTranslations} from 'next-intl/server';
 
export default async function HomePage() {
  const t = await getTranslations('HomePage');
  return (
    <main className="h-dvh overflow-auto">
      <div className="p-2 flex items-center h-full justify-center">
        <h1>{t('title')}</h1>
      </div>
    </main>
  );
}