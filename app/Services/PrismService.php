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

        try {
            $response = Prism::structured()
                ->using(Provider::OpenAI, $model)
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
