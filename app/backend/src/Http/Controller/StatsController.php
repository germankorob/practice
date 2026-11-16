<?php

declare(strict_types=1);

namespace Recall\Http\Controller;

use DateTimeImmutable;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Recall\Domain\Stats;
use Recall\Domain\Streak;
use Recall\Domain\ValueObject\Day;
use Recall\Domain\ValueObject\Interval;
use Recall\Http\Json;
use Recall\Http\Serializer;
use Recall\Infrastructure\Persistence\CardRepository;
use Recall\Infrastructure\Persistence\ReviewRepository;

final readonly class StatsController
{
    public function __construct(
        private CardRepository $cards,
        private ReviewRepository $reviews,
        private Serializer $serializer,
        private DateTimeImmutable $now,
    ) {}

    public function index(Request $request, Response $response): Response
    {
        $today = Day::today($this->now);

        // «Сегодня» — всё, что пора повторить сейчас, включая просроченное:
        // ровно столько карточек в очереди.
        $dueToday = $this->cards->countDueOn($today);

        // «За неделю» — сколько придётся повторить за 7 дней начиная с сегодня.
        $dueWeek = $this->cards->countDueOn($today->plusDays(Interval::ofDays(6)));

        // «Серия» — сколько дней подряд были повторения (см. Streak).
        $streak = Streak::count($this->reviews->daysNewestFirst($this->now->getTimezone()), $today);

        $stats = new Stats(dueToday: $dueToday, dueWeek: $dueWeek, streak: $streak);

        return Json::write($response, $this->serializer->serialize($stats));
    }
}
