<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ErrorHistoryController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $showAll = $request->boolean('show_all');

        $query = $request->user()
            ->textSubmissions()
            ->with('errors.errorCategory')
            ->latest();

        if (! $showAll) {
            $query->whereHas('errors');
        }

        return Inertia::render('ErrorHistory', [
            'submissions' => $query->paginate(15)->withQueryString(),
            'showAll' => $showAll,
        ]);
    }
}
