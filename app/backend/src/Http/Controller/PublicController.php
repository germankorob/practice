<?php

declare(strict_types=1);

namespace Recall\Http\Controller;

use DateTimeImmutable;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Recall\Domain\Streak;
use Recall\Domain\ValueObject\Day;
use Recall\Http\Json;
use Recall\Infrastructure\Persistence\CardRepository;
use Recall\Infrastructure\Persistence\ReviewRepository;

/**
 * Публичная страница «сколько я выучил». Отдаёт только числа: заметки личные,
 * поэтому ни заголовков, ни текста, ни тегов здесь нет.
 */
final readonly class PublicController
{
    /** Карточку, которую не нужно показывать ближайшие три недели, считаем выученной. */
    private const int LEARNED_INTERVAL_DAYS = 21;

    public function __construct(
        private CardRepository $cards,
        private ReviewRepository $reviews,
        private DateTimeImmutable $now,
    ) {}

    public function progress(Request $request, Response $response): Response
    {
        $today = Day::today($this->now);

        return Json::write($response, [
            'cards_total' => $this->cards->count(),
            'cards_learned' => $this->cards->countWithIntervalAtLeast(self::LEARNED_INTERVAL_DAYS),
            'reviews_total' => $this->reviews->count(),
            'streak' => Streak::count($this->reviews->daysNewestFirst($this->now->getTimezone()), $today),
        ]);
    }
}
