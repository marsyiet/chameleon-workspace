"use client"

import React from 'react'
import AssetListCard from './_components/assets-list-card'
import GeoMapCard from '../_components/geo-map/geo-map-card'

const Page = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Colonne de gauche : Reste figée (sticky) pendant le scroll du document */}
        <div className="lg:col-span-1 flex flex-col gap-4 sticky top-4 self-start">
          <h3 className='font-normal'>Inventaire</h3>
          <GeoMapCard />
        </div>

        {/* Colonne de droite : Se déroule naturellement sur toute sa hauteur */}
        <AssetListCard className="lg:col-span-1" />

      </div>
    </div>
  )
}

export default Page