"use client"

import React from 'react'
import GeoMapCard from '../[scan]/_components/map-card'
import AssetListCard from './_components/assets-list-card'

const page = () => {
    return (
        <div className='flex flex-col gap-4'>
            <h2 className='valenzka'>Inventory</h2>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
                <GeoMapCard className="lg:col-span-2" />
                <AssetListCard className="lg:col-span-1" />
            </div>
        </div>
    )
}

export default page