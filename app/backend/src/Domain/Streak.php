<?php

declare(strict_types=1);

namespace Recall\Domain;

use Recall\Domain\ValueObject\Day;

/**
 * Серия: сколько дней подряд были повторения.
 *
 * Сегодняшний день ещё не закончился, поэтому серия не обрывается, пока
 * сегодня повторений не было, но вчера были: она просто ещё не продлена.
 */
final class Streak
{
    /**
     * @param iterable<Day> $reviewDays дни повторений от последнего к раннему;
     *                                  один день может встречаться несколько раз
     */
    public static function count(iterable $reviewDays, Day $today): int
    {
        $streak = 0;
        $lastDay = null;

        foreach ($reviewDays as $day) {
            if ($lastDay === null) {
                // Последнее повторение было раньше вчерашнего дня — серия уже прервалась.
                if (!$day->equals($today) && !$day->equals($today->previousDay())) {
                    return 0;
                }

                $streak = 1;
                $lastDay = $day;

                continue;
            }

            if ($day->equals($lastDay)) {
                // Ещё одно повторение в тот же день.
                continue;
            }

            if (!$day->equals($lastDay->previousDay())) {
                // Пропущенный день: дальше считать нечего.
                break;
            }

            ++$streak;
            $lastDay = $day;
        }

        return $streak;
    }
}
