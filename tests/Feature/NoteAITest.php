<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\PrismService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery\MockInterface;
use Tests\TestCase;

class NoteAITest extends TestCase
{
    use RefreshDatabase;

    public function test_can_refactor_note()
    {
        $user = User::factory()->create();

        $this->mock(PrismService::class, function (MockInterface $mock) {
            $mock->shouldReceive('refactorNote')
                ->once()
                ->with('Original content', 'refactor')
                ->andReturn([
                    'title' => 'Refactored Title',
                    'content' => 'Refactored Content'
                ]);
        });

        $response = $this->actingAs($user)
            ->withoutMiddleware()
            ->postJson(route('notes.ai.refactor'), [
                'content' => 'Original content',
                'mode' => 'refactor'
            ]);

        $response->assertSuccessful()
            ->assertJson([
                'title' => 'Refactored Title',
                'content' => 'Refactored Content'
            ]);
    }

    public function test_can_improve_note()
    {
        $user = User::factory()->create();

        $this->mock(PrismService::class, function (MockInterface $mock) {
            $mock->shouldReceive('refactorNote')
                ->once()
                ->with('Original content', 'improve')
                ->andReturn([
                    'title' => 'Improved Title',
                    'content' => 'Improved Content'
                ]);
        });

        $response = $this->actingAs($user)
            ->withoutMiddleware()
            ->postJson(route('notes.ai.refactor'), [
                'content' => 'Original content',
                'mode' => 'improve'
            ]);

        $response->assertSuccessful()
            ->assertJson([
                'title' => 'Improved Title',
                'content' => 'Improved Content'
            ]);
    }
}
