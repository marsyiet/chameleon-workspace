import { ProgressArc } from '@/components/custom/progress-arc'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Asset } from '@/types/asset'

interface RiskScoreCardProps {
    className?: string
    assets: Asset[]
    scanTarget?: string
}

const RiskScoreCard = ({ className, assets, scanTarget }: RiskScoreCardProps) => {
    // riskScore.value est sur 0-10 (chapitre 2, §2.3.1) -> converti sur 100
    // pour l'affichage, cohérent avec scoreLabel="/ 100" du composant ProgressArc.
    const scores = assets
        .map((a) => a.riskScore?.value ?? 0)
        .filter((v) => v > 0)

    const maxScore = scores.length > 0 ? Math.max(...scores) : 0
    const displayScore = Math.round(maxScore * 10)

    const worstAsset = assets.find((a) => (a.riskScore?.value ?? 0) === maxScore)

    const message =
        displayScore === 0
            ? "Aucun score de risque disponible pour l'instant."
            : displayScore >= 70
                ? `Risque élevé détecté sur ${worstAsset?.hostname || worstAsset?.ipAddress || "un actif"}.`
                : displayScore >= 40
                    ? `Risque modéré détecté sur ${worstAsset?.hostname || worstAsset?.ipAddress || "un actif"}.`
                    : "Aucun risque significatif détecté sur ce périmètre."

    return (
        <Card className={cn("", className)}>
            <CardHeader>
                <div className="flex items-center justify-between gap-2">
                    <h5 className="text-foreground">Risk Score</h5>
                    <Button className="ml-auto">Actions</Button>
                </div>
            </CardHeader>
            <CardContent>
                <ProgressArc
                    value={displayScore}
                    barWidth={10}
                    gap={4}
                    gradient={["oklch(0.58 0.26 290)", "oklch(0.68 0.23 10)"]}
                    showScore
                    scoreLabel="/ 100"
                    glow={true}
                    emptyOpacity={0.3}
                    barLength={0.10}
                    radius={0.40}
                />
            </CardContent>
            <CardFooter className="flex flex-col gap-4 items-start justify-start">
                <p className='text-sm text-muted-foreground'>
                    {message}
                </p>
            </CardFooter>
        </Card>
    )
}

export default RiskScoreCard