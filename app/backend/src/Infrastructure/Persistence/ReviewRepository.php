<?php

declare(strict_types=1);

namespace Recall\Infrastructure\Persistence;

use Cycle\ORM\EntityManager;
use Cycle\ORM\ORMInterface;
use DateTimeZone;
use Generator;
use Recall\Domain\Review;
use Recall\Domain\ValueObject\Day;
use Recall\Domain\ValueObject\ReviewId;

/** Доступ к повторениям через Cycle ORM. */
final readonly class ReviewRepository
{
    public function __construct(private ORMInterface $orm) {}

    public function save(Review $review): void
    {
        (new EntityManager($this->orm))->persist($review)->run();
    }

    /**
     * Дни повторений от последнего к раннему (один день может встречаться несколько раз).
     *
     * Отдельной даты в таблице нет: момент повторения зашит в его UUIDv7, а такие id
     * сортируются по времени. Поэтому читаем одни id и отдаём дни по одному — серия
     * обычно обрывается быстро, и всю историю в память поднимать не нужно.
     *
     * @return Generator<int, Day>
     */
    public function daysNewestFirst(DateTimeZone $zone): Generator
    {
        $rows = $this->orm->getSource(Review::class)->getDatabase()
            ->select('id')
            ->from('reviews')
            ->orderBy('id', 'DESC')
            ->run();

        foreach ($rows as $row) {
            if (!is_array($row)) {
                continue;
            }
            if (!is_string($row['id'] ?? null)) {
                continue;
            }
            $reviewedAt = ReviewId::fromString($row['id'])->createdAt()->setTimezone($zone);

            yield Day::today($reviewedAt);
        }
    }
}
