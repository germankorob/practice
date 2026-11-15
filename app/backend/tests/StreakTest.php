<?php

declare(strict_types=1);

namespace Recall\Tests;

use Recall\Domain\Streak;
use Recall\Domain\ValueObject\Day;
use Testo\Assert;
use Testo\Test;

/** Подсчёт серии дней по списку дней повторений (от последнего к раннему). */
final class StreakTest
{
    #[Test]
    public function noReviewsMeansNoStreak(): void
    {
        Assert::same(Streak::count([], new Day('2026-06-10')), 0);
    }

    #[Test]
    public function countsConsecutiveDaysEndingToday(): void
    {
        $days = $this->days(['2026-06-10', '2026-06-10', '2026-06-09', '2026-06-08']);

        Assert::same(Streak::count($days, new Day('2026-06-10')), 3);
    }

    #[Test]
    public function streakSurvivesUntilTodayIsOver(): void
    {
        $days = $this->days(['2026-06-09', '2026-06-08']);

        Assert::same(Streak::count($days, new Day('2026-06-10')), 2);
    }

    #[Test]
    public function aMissedDayBreaksTheStreak(): void
    {
        $days = $this->days(['2026-06-10', '2026-06-08', '2026-06-07']);

        Assert::same(Streak::count($days, new Day('2026-06-10')), 1);
    }

    #[Test]
    public function lastReviewBeforeYesterdayMeansStreakIsOver(): void
    {
        $days = $this->days(['2026-06-08', '2026-06-07']);

        Assert::same(Streak::count($days, new Day('2026-06-10')), 0);
    }

    /**
     * @param  list<string> $values
     * @return list<Day>
     */
    private function days(array $values): array
    {
        $days = [];
        foreach ($values as $value) {
            $days[] = new Day($value);
        }

        return $days;
    }
}
