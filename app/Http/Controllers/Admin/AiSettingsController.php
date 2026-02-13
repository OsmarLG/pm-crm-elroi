<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AiConfiguration;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class AiSettingsController extends Controller
{
    public function index()
    {
        $configurations = AiConfiguration::with('models')->get()->keyBy('provider');

        return Inertia::render('admin/settings/ai', [
            'configurations' => $configurations->map(fn($config) => [
                'id' => $config->id,
                'provider' => $config->provider,
                'is_active' => $config->is_active,
                'meta' => $config->meta ?? [], // Send meta (project_id, prompts)
                // Do not return the real API key to the frontend for security,
                // unless you want to show it. Better to show a masked version or empty.
                'api_key' => $config->api_key ? '********' : '',
                'models' => $config->models->map(fn($model) => [
                    'id' => $model->id,
                    'name' => $model->name,
                    'api_name' => $model->api_name,
                    'is_active' => $model->is_active,
                    'is_selected' => $model->is_selected,
                ]),
            ])->values(), // Return as array for frontend
            'available_providers' => [
                'openai',
                'gemini',
            ]
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'provider' => 'required|string',
            'api_key' => 'nullable|string',
            'is_active' => 'boolean',
            'project_id' => 'nullable|string',
            'note_refactor_prompt' => 'nullable|string',
            'note_improve_prompt' => 'nullable|string',
        ]);

        $config = AiConfiguration::firstOrNew(['provider' => $validated['provider']]);

        // Only update API key if it's provided and not the masked version
        if (!empty($validated['api_key']) && $validated['api_key'] !== '********') {
            $config->api_key = $validated['api_key'];
        }

        if ($validated['is_active']) {
            // Deactivate all others if this one is being activated
            AiConfiguration::where('provider', '!=', $validated['provider'])->update(['is_active' => false]);
            $config->is_active = true;
        } else {
            $config->is_active = false;
        }

        // Save meta (project_id, prompts)
        $meta = $config->meta ?? [];
        if (isset($validated['project_id'])) {
            $meta['project_id'] = $validated['project_id'];
        }
        if (isset($validated['note_refactor_prompt'])) {
            $meta['note_refactor_prompt'] = $validated['note_refactor_prompt'];
        }
        if (isset($validated['note_improve_prompt'])) {
            $meta['note_improve_prompt'] = $validated['note_improve_prompt'];
        }
        $config->meta = $meta;

        $config->save();

        return Redirect::back()->with('success', 'AI Configuration updated.');
    }

    public function storeModel(Request $request)
    {
        $validated = $request->validate([
            'provider' => 'required|string|exists:ai_configurations,provider',
            'name' => 'required|string|max:255',
            'api_name' => 'required|string|max:255',
        ]);

        $config = AiConfiguration::where('provider', $validated['provider'])->firstOrFail();

        $config->models()->create([
            'name' => $validated['name'],
            'api_name' => $validated['api_name'],
            'is_active' => true,
        ]);

        return Redirect::back()->with('success', 'AI Model added.');
    }

    public function updateModel(Request $request, $id)
    {
        $model = \App\Models\AiModel::findOrFail($id);

        $validated = $request->validate([
            'is_active' => 'boolean',
            'is_selected' => 'boolean',
        ]);

        if (isset($validated['is_active'])) {
            $model->is_active = $validated['is_active'];
        }

        if (isset($validated['is_selected']) && $validated['is_selected']) {
            // Deselect other models for this configuration
            $model->configuration->models()->where('id', '!=', $id)->update(['is_selected' => false]);
            $model->is_selected = true;
        }

        $model->save();

        return Redirect::back()->with('success', 'AI Model updated.');
    }

    public function destroyModel($id)
    {
        $model = \App\Models\AiModel::findOrFail($id);
        $model->delete();

        return Redirect::back()->with('success', 'AI Model deleted.');
    }
}
