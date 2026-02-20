<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\ProgressTrackerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function dashboard(Request $request, ProgressTrackerService $service): JsonResponse
    {
        return response()->json($service->getDashboardStats($request->user()));
    }

    public function weakAreas(Request $request, ProgressTrackerService $service): JsonResponse
    {
        return response()->json($service->getWeakAreas($request->user()));
    }
}
