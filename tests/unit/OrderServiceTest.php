<?php
use App\OrderService;

class OrderServiceTest extends \Codeception\Test\Unit
{
    public function testCalcTotal()
    {
        $svc = new OrderService();
        $total = $svc->calcTotal([
            ['price' => 100, 'qty' => 2],
            ['price' => 250, 'qty' => 1],
        ]);
        $this->assertSame(450, $total);
    }

    public function testInvalid()
    {
        $this->expectException(\InvalidArgumentException::class);
        (new OrderService())->calcTotal([
            ['price' => -1, 'qty' => 1],
        ]);
    }
}
