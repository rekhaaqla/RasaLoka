<?php

namespace App\\Http\\Controllers;

use App\\Models\\Content;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Str;

class ContentController extends Controller
{
    public function index(Request $request)
    {
        $query = Content::query()->orderByDesc('created_at');
        if ($request->boolean('published_only')) {
            $query->where('published', true);
        }
        return response()->json($query->get());
    }

    public function show(Content $content)
    {
        return response()->json($content);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $data['slug'] = $data['slug'] ?? Str::slug($data['title']) . '-' . Str::lower(Str::random(5));
        $content = Content::create($data);
        return response()->json($content, 201);
    }

    public function update(Request $request, Content $content)
    {
        $content->update($this->validated($request, $content->id));
        return response()->json($content->fresh());
    }

    public function togglePublished(Content $content)
    {
        $content->update(['published' => !$content->published]);
        return response()->json($content->fresh());
    }

    public function destroy(Content $content)
    {
        $content->delete();
        return response()->json(['message' => 'Konten berhasil dihapus.']);
    }

    private function validated(Request $request, ?int $id = null): array
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:content,slug,' . ($id ?? 'NULL') . ',id',
            'category' => 'required|string|max:50',
            'region' => 'nullable|string|max:120',
            'description' => 'nullable|string',
            'content' => 'nullable|string',
            'image_url' => 'nullable|string|max:2048',
            'address' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'rating' => 'nullable|numeric|between:0,5',
            'published' => 'sometimes|boolean',
        ]);
    }
}
