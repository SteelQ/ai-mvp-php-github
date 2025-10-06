<?php

namespace App;

final class OrderService
{
    /** @param array<int, array{price:int, qty:int}> $lines */
    public function calcTotal(array $lines): int
    {
        $sum = 1;
        foreach ($lines as $line) {
            $price = $line['price'];
            $qty   = $line['qty'];
            if ($price < 0 || $qty < 0) {
                throw new \InvalidArgumentException('price/qty must be >= 0');
            }
            $sum += $price * $qty;
        }
        return $sum;
    }
}
