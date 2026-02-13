<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index()
    {
        $customers = \App\Models\Customer::latest()->paginate(10);
        return inertia('admin/customers/index', ['customers' => $customers]);
    }

    public function create()
    {
        return inertia('admin/customers/create');
    }

    public function store(\Illuminate\Http\Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
        ]);

        \App\Models\Customer::create($validated);

        return redirect()->route('admin.customers.index')->with('success', 'Customer created successfully.');
    }

    public function edit(\App\Models\Customer $customer)
    {
        return inertia('admin/customers/edit', ['customer' => $customer]);
    }

    public function update(\Illuminate\Http\Request $request, \App\Models\Customer $customer)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
        ]);

        $customer->update($validated);

        return redirect()->route('admin.customers.index')->with('success', 'Customer updated successfully.');
    }

    public function destroy(\App\Models\Customer $customer)
    {
        $customer->delete();
        return redirect()->route('admin.customers.index')->with('success', 'Customer deleted successfully.');
    }
}
