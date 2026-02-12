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
        $configurations = AiConfiguration::all()->keyBy('provider');

        return Inertia::render('admin/settings/ai', [
            'configurations' => $configurations->map(fn($config) => [
                'id' => $config->id,
                'provider' => $config->provider,
                'is_active' => $config->is_active,
                // Do not return the real API key to the frontend for security,
                // unless you want to show it. Better to show a masked version or empty.
                'api_key' => $config->api_key ? '********' : '',
            ]),
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

        $config->save();

        return Redirect::back()->with('success', 'AI Configuration updated.');
    }
}
