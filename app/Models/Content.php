<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;

class Content extends Model
{
    protected $table = 'content';

    protected $fillable = [
        'title', 'slug', 'category', 'region', 'description', 'content',
        'image_url', 'address', 'latitude', 'longitude', 'rating',
        'published',
    ];

    protected $casts = [
        'published' => 'boolean',
        'latitude' => 'float',
        'longitude' => 'float',
        'rating' => 'float',
    ];
}
