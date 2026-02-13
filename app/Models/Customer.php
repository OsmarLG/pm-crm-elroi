<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    /** @use HasFactory<\Database\Factories\CustomerFactory> */
    protected $fillable = ['name', 'email', 'phone', 'address'];

    public function projects()
    {
        return $this->hasMany(Project::class);
    }
}
