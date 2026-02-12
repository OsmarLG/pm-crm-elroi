<?php

namespace App\Services;

use Prism\Prism\Facades\Prism;
use Prism\Prism\Schema\ObjectSchema;
use Prism\Prism\Schema\StringSchema;
use Prism\Prism\Enums\Provider;
use Illuminate\Support\Facades\Log;

class PrismService
{
    public function refactorNote(string $content, string $mode = 'refactor'): array
    {
        $model = "gpt-4o-mini";

        $schema = new ObjectSchema(
            name: 'note_refactor',
            description: 'Refactored note content',
            properties: [
                new StringSchema('title', 'The note title'),
                new StringSchema('content', 'The refactored note markdown content'),
            ],
            requiredFields: ['title', 'content']
        );

        $systemPrompt = "Eres un asistente experto en redacción y organización de notas. Tu objetivo es mejorar la claridad, estructura y formato de las notas sin perder información.";

        if ($mode === 'improve') {
            $model = "gpt-4.1-mini";
            $systemPrompt .= " Además, mejora el contenido expandiendo ideas clave, corrigiendo gramática y mejorando el tono para que sea más profesional y útil.";
        } else {
            $systemPrompt .= " Solo refactoriza el formato y la estructura, NO cambies el significado ni agregues información nueva, solo organiza mejor lo que ya existe.";
        }

        $prompt = "Por favor, procesa la siguiente nota:\n\n" . $content;

        $config = \App\Models\AiConfiguration::where('is_active', true)->first();

        // Default to OpenAI if nothing is configured
        $provider = Provider::OpenAI;
        $model = "gpt-4o-mini";
        $apiKey = config('prism.providers.openai.api_key');

        if ($config) {
            if ($config->provider === 'gemini') {
                $provider = Provider::Gemini;
                $model = "gemini-2.5-flash";
                // Runtime config override for Gemini
                config(['prism.providers.gemini.api_key' => $config->api_key]);
            } elseif ($config->provider === 'openai') {
                $provider = Provider::OpenAI;
                $model = "gpt-4o-mini";
                // Runtime config override for OpenAI
                config(['prism.providers.openai.api_key' => $config->api_key]);
            }
        }

        try {
            $response = Prism::structured()
                ->using($provider, $model)
                ->withSystemPrompt($systemPrompt)
                ->withPrompt($prompt)
                ->withSchema($schema)
                ->generate();

            return $response->structured;
        } catch (\Exception $e) {
            Log::error("Prism AI Error: " . $e->getMessage());
            throw $e;
        }
    }
}
