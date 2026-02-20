<?php

namespace App\Http\Controllers;

use App\Services\ProgressTrackerService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request, ProgressTrackerService $service): Response
    {
        $user = $request->user();

        return Inertia::render('Dashboard', [
            'stats' => $service->getDashboardStats($user),
            'weakAreas' => $service->getWeakAreas($user),
        ]);
    }
}
