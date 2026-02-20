<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ErrorHistoryController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $submissions = $request->user()
            ->textSubmissions()
            ->with('errors.errorCategory')
            ->latest()
            ->paginate(15);

        return Inertia::render('ErrorHistory', [
            'submissions' => $submissions,
        ]);
    }
}
