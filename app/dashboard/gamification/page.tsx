"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Star, Flame, Award, TrendingUp } from "lucide-react"

interface GamificationStats {
  xp_points: number
  level: number
  next_level_xp: number
  current_level_xp: number
  daily_streak: number
  longest_streak: number
  badges: Badge[]
  achievements: Achievement[]
}

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earned_at: string
}

interface Achievement {
  id: string
  title: string
  description: string
  progress: number
  target: number
  reward_xp: number
  completed: boolean
}

interface LeaderboardEntry {
  rank: number
  user_name: string
  xp_points: number
  level: number
  badges_count: number
}

export default function GamificationPage() {
  const [stats, setStats] = useState<GamificationStats | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
    loadLeaderboard()
  }, [])

  const loadStats = async () => {
    try {
      const res = await fetch("/api/gamification/stats")
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error("[v0] Error loading stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadLeaderboard = async () => {
    try {
      const res = await fetch("/api/gamification/leaderboard")
      if (res.ok) {
        const data = await res.json()
        setLeaderboard(data.leaderboard || [])
      }
    } catch (error) {
      console.error("[v0] Error loading leaderboard:", error)
    }
  }

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const xpProgress = ((stats.current_level_xp / stats.next_level_xp) * 100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Trophy className="h-8 w-8" />
          Gamification
        </h1>
        <p className="text-muted-foreground mt-2">Track your progress and unlock achievements</p>
      </div>

      {/* Main Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.level}</div>
            <Progress value={xpProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {stats.current_level_xp} / {stats.next_level_xp} XP
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.daily_streak}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Longest: {stats.longest_streak} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Total XP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.xp_points.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.badges.length} badges earned
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="badges" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="badges">Badges ({stats.badges.length})</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Earned Badges</CardTitle>
              <CardDescription>Collect badges by completing tasks and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.badges.length === 0 ? (
                  <p className="col-span-full text-center text-muted-foreground py-8">
                    No badges earned yet. Complete tasks to earn badges!
                  </p>
                ) : (
                  stats.badges.map((badge) => (
                    <div key={badge.id} className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-2xl">
                        {badge.icon}
                      </div>
                      <p className="text-sm font-medium text-center">{badge.name}</p>
                      <p className="text-xs text-muted-foreground text-center">
                        {new Date(badge.earned_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Complete challenges to unlock achievements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.achievements.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No achievements available yet
                </p>
              ) : (
                stats.achievements.map((achievement) => (
                  <div key={achievement.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>
                      <Badge className={achievement.completed ? "bg-green-500" : "bg-gray-500"}>
                        +{achievement.reward_xp} XP
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>Progress</span>
                        <span>
                          {achievement.progress} / {achievement.target}
                        </span>
                      </div>
                      <Progress 
                        value={(achievement.progress / achievement.target) * 100}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Global Leaderboard</CardTitle>
              <CardDescription>Top learners this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboard.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No leaderboard data yet
                  </p>
                ) : (
                  leaderboard.map((entry) => (
                    <div
                      key={entry.rank}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full font-bold bg-primary text-primary-foreground">
                        {entry.rank}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{entry.user_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Level {entry.level} • {entry.badges_count} badges
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{entry.xp_points.toLocaleString()} XP</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
