'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Flame, Star, Trophy } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function GamificationStats() {
  const { data } = useSWR('/api/gamification/stats', fetcher);

  if (!data) {
    return <div>Loading...</div>;
  }

  const { xp, level, nextLevelXP, currentLevelProgress, streak, badges } = data;
  const progressPercentage = (currentLevelProgress / 1000) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Level Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">Level {level}</span>
              <span className="text-sm text-gray-600">{xp.toLocaleString()} XP</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="text-xs text-gray-600">
              {currentLevelProgress.toLocaleString()} / 1000 XP to next level
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Streak */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-orange-500">
              {streak.current} days
            </div>
            <div className="text-sm text-gray-600">
              Longest: {streak.longest} days
            </div>
            {streak.lastActivity && (
              <div className="text-xs text-gray-500">
                Last activity: {new Date(streak.lastActivity).toLocaleDateString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Badges ({badges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {badges.length === 0 ? (
              <p className="text-sm text-gray-600">
                Keep learning to earn badges!
              </p>
            ) : (
              badges.map((badge: any) => (
                <Badge
                  key={badge.id}
                  variant="secondary"
                  className="px-3 py-1"
                >
                  <Star className="w-3 h-3 mr-1" />
                  {badge.badges?.name || 'Achievement'}
                </Badge>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
