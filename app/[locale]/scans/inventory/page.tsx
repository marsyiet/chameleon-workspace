"use client"

import React from 'react'
import AssetListCard from './_components/assets-list-card'
import GeoMapCard from '../_components/geo-map/geo-map-card'

const page = () => {
    return (
        <div className='flex flex-col gap-4'>
            <h3>Inventaire</h3>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 relative'>
                <GeoMapCard className="lg:col-span-2 sticky top-4" />
                <div className="h-20">
                    <AssetListCard className="lg:col-span-1" />
                </div>
            </div>
        </div>
    )
}

export default page