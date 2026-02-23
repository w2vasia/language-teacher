<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ErrorHistoryController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $source = $request->query('source', 'text-check');
        $showAll = $request->boolean('show_all');

        $submissions = null;
        $practiceSessions = null;

        if ($source === 'practice') {
            $query = $request->user()
                ->practiceSessions()
                ->with(['errors.errorCategory', 'errorCategory'])
                ->latest();

            if (! $showAll) {
                $query->whereHas('errors');
            }

            $practiceSessions = $query->paginate(15)->withQueryString();
        } else {
            $query = $request->user()
                ->textSubmissions()
                ->with('errors.errorCategory')
                ->latest();

            if (! $showAll) {
                $query->whereHas('errors');
            }

            $submissions = $query->paginate(15)->withQueryString();
        }

        return Inertia::render('ErrorHistory', [
            'submissions' => $submissions,
            'practiceSessions' => $practiceSessions,
            'showAll' => $showAll,
            'source' => $source,
        ]);
    }
}
