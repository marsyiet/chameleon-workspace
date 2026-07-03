import { ProgressArc } from '@/components/custom/progress-arc'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import React from 'react'

const RiskScoreCard = ({className} : {className?: string}) => {
    return (
        <Card className={cn("", className)}>
            <CardHeader>
                <div className="flex items-center justify-between gap-2">
                    <h5 className="valenzka text-foreground">Risk Score</h5>
                    <Button className="ml-auto">Actions</Button>
                </div>
            </CardHeader>
            <CardContent>
                <ProgressArc
                    value={62}
                    barWidth={10}          // largeur px
                    gap={4}               // gap px
                    color="oklch(...)"    // couleur unie
                    gradient={["oklch(0.58 0.26 290)", "oklch(0.68 0.23 10)"]}
                    showScore             // affiche le score au centre
                    scoreLabel="/ 100"
                    glow={true}                  // halo lumineux sur barres remplies
                    emptyOpacity={0.3}
                    barLength={0.10}      // longueur radiale en % du rayon
                    radius={0.40}         // rayon en % de la largeur
                    className="..."
                />
            </CardContent>
            <CardFooter className="flex flex-col gap-4 items-start justify-start" >
                <p className='text-sm text-muted-foreground'>Vous avez un risque élevé de vulnérabilités sur le domaine example.com</p>
            </CardFooter>
        </Card>
    )
}

export default RiskScoreCard