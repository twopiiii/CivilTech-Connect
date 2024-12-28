<?php

use App\Http\Controllers\admin\DashboardController;
use App\Http\Controllers\AuthenticationController;
use App\Http\Controllers\BasicInfoController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ContactsController;
use App\Http\Controllers\FounderController;
use App\Http\Controllers\JobOpportunitiesController;
use App\Http\Controllers\LearningMaterialsController;
use App\Http\Controllers\NotifsController;
use App\Http\Controllers\OjtCompaniesController;
use App\Http\Controllers\SocialsController;
use App\Http\Controllers\StudentAccountController;
use App\Http\Controllers\TesdaCategoryController;
use App\Http\Controllers\TesdaCoursesController;
use App\Http\Controllers\TesdaTrainingCentersController;
use App\Http\Controllers\TopicController;
use App\Http\Controllers\UploadStudentFileController;
use App\Models\BasicInfo;
use App\Models\JobOpportunities;
use App\Models\LearningMaterials;
use App\Models\TesdaCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('authenticate', [AuthenticationController::class, 'authenticate']);

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::group(['middleware' => ['auth:sanctum']], function () {
    //Protected Routes
    Route::get('dashboard', [DashboardController::class, 'index']);
    Route::get('logout', [AuthenticationController::class, 'logout']);
    Route::post('admin-change-password', [AuthenticationController::class, 'changePassword']);

    Route::post('categories', [CategoryController::class, 'create']);
    Route::get('categories', [CategoryController::class, 'fetch']);
    Route::delete('/categories/{id}', [CategoryController::class, 'delete']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::post('/categories/update-sort-order', [CategoryController::class, 'updateSortOrder']);

    Route::post('topics', [TopicController::class, 'create']);
    Route::get('topics', [TopicController::class, 'fetch']);
    Route::delete('/topics/{id}', [TopicController::class, 'delete']);
    Route::put('/topics/{id}', [TopicController::class, 'update']);

    Route::post('learningMaterials', [LearningMaterialsController::class, 'create']);
    Route::get('learningMaterials', [LearningMaterialsController::class, 'view']);
    Route::get('learningMaterials', [LearningMaterialsController::class, 'fetch']);
    Route::delete('/learningMaterials/{id}', [LearningMaterialsController::class, 'delete']);
    Route::put('/learning-materials/{id}', [LearningMaterialsController::class, 'update']);

    Route::put('/basic-info/{id}', [BasicInfoController::class, 'update']);
    Route::get('/basic-info', [BasicInfoController::class, 'fetch']);

    Route::get('founders', [FounderController::class, 'fetch']);
    Route::post('/founders/{id}', [FounderController::class, 'update']);

    Route::post('upload-file', [UploadStudentFileController::class, 'uploadStudentFile']);
    Route::get('fetch-files', [UploadStudentFileController::class, 'fetchFiles']);
    Route::get('/fetch-students', [UploadStudentFileController::class, 'fetchStudents']);
    Route::delete('/delete-files', [UploadStudentFileController::class, 'deleteFiles']);

    Route::post('contacts', [ContactsController::class, 'create']);
    Route::get('contacts', [ContactsController::class, 'fetch']);
    Route::delete('/contacts/{id}', [ContactsController::class, 'delete']);
    Route::put('/contacts/{id}', [ContactsController::class, 'update']);

    Route::post('socials', [SocialsController::class, 'create']);
    Route::get('socials', [SocialsController::class, 'fetch']);
    Route::delete('/socials/{id}', [SocialsController::class, 'delete']);
    Route::put('/socials/{id}', [SocialsController::class, 'update']);

    Route::post('job-opportunities', [JobOpportunitiesController::class, 'create']);
    Route::get('job-opportunities', [JobOpportunitiesController::class, 'fetch']);
    Route::delete('/job-opportunities/{id}', [JobOpportunitiesController::class, 'delete']);
    Route::post('/update-job-opportunities/{id}', [JobOpportunitiesController::class, 'update']);

    Route::post('ojt-companies', [OjtCompaniesController::class, 'create']);
    Route::get('ojt-companies', [OjtCompaniesController::class, 'fetch']);
    Route::delete('/ojt-companies/{id}', [OjtCompaniesController::class, 'delete']);
    Route::post('/update-ojt-companies/{id}', [OjtCompaniesController::class, 'update']);
    Route::post('/update-slots/{id}', [OjtCompaniesController::class, 'updateSlots']);
    Route::get('ojt-referrals', [OjtCompaniesController::class, 'fetchCompanyReferrals']);
    Route::post('/update-status/{id}', [OjtCompaniesController::class, 'updateStatus']);
    Route::delete('/delete-referral/{id}', [OjtCompaniesController::class, 'deleteReferral']);
    Route::get('ojt-applications', [OjtCompaniesController::class, 'fetchCompanyApplications']);
    Route::post('/update-application-status/{id}', [OjtCompaniesController::class, 'updateApplicationStatus']);
    Route::delete('/delete-application/{id}', [OjtCompaniesController::class, 'deleteApplication']);
    // Route::get('/download/{filename}', [OjtCompaniesController::class, 'downloadFile']);

    Route::post('tesda-categories', [TesdaCategoryController::class, 'create']);
    Route::get('tesda-categories', [TesdaCategoryController::class, 'fetch']);
    Route::delete('/tesda-categories/{id}', [TesdaCategoryController::class, 'delete']);
    Route::put('/tesda-categories/{id}', [TesdaCategoryController::class, 'update']);

    Route::post('tesda-training-center', [TesdaTrainingCentersController::class, 'create']);
    Route::get('training-centers', [TesdaTrainingCentersController::class, 'fetch']);
    Route::delete('/delete-training-center/{id}', [TesdaTrainingCentersController::class, 'delete']);
    Route::put('/edit-training-center/{id}', [TesdaTrainingCentersController::class, 'update']);

    Route::get('tesda-courses', [TesdaCoursesController::class, 'fetch']);
    Route::post('add-tesda-courses', [TesdaCoursesController::class, 'create']);
    Route::delete('/tesda-courses/{id}', [TesdaCoursesController::class, 'delete']);
    Route::put('/tesda-courses/{id}', [TesdaCoursesController::class, 'update']);
});


// API Routes for User Display (without login)
Route::get('/user-display-basic-info', function (Request $request) {
    $title = $request->query('title'); // Get the 'title' query parameter
    $info = BasicInfo::where('title', $title)->first(); // Use the BasicInfo model
    return response()->json($info);
});

Route::get('user-display-founder', [FounderController::class, 'fetchForUser']);
Route::get('user-display-contacts', [ContactsController::class, 'fetchForUser']);
Route::get('user-display-socials', [SocialsController::class, 'fetchForUser']);

Route::get('/display-in-user-categories', [LearningMaterialsController::class, 'indexCategories']);
Route::get('/display-in-user-topics/{categoryId}', [LearningMaterialsController::class, 'indexTopics']);
Route::get('/display-in-user-learning-materials/{topicId}', [LearningMaterialsController::class, 'indexLearningMaterials']);

Route::get('user-display-job-opportunities', [JobOpportunitiesController::class, 'fetchInUser']);

Route::get('user-display-ojt-companies', [OjtCompaniesController::class, 'fetchInUser']);
Route::post('save-company-referral', [OjtCompaniesController::class, 'store']);
Route::post('apply-ojt', [OjtCompaniesController::class, 'apply']);

// Route::get('fetch-latest-student-info', [StudentAccountController::class, 'fetchLatestStudentInfo']);

Route::get('/display-in-user-tesda-categories', [TesdaCategoryController::class, 'indexCategories']);
Route::get('/display-in-user-tesda-learning-courses/{categoryId}', [TesdaCategoryController::class, 'indexCourses']);

Route::post('user-login', [StudentAccountController::class, 'login']);
Route::post('verify-password', [StudentAccountController::class, 'verify']);
Route::post('change-password', [StudentAccountController::class, 'changePassword']);
Route::post('verify-forgot-password', [StudentAccountController::class, 'verifyStudentNumber']);
Route::get('/reset-password/{token}', [StudentAccountController::class, 'showResetForm'])->name('password.reset');
Route::post('/reset-password', [StudentAccountController::class, 'reset'])->name('password.update');

Route::post('/emailed-contact', [ContactsController::class, 'sendEmail']);

Route::get('user-training-center', [TesdaTrainingCentersController::class, 'fetch']);

Route::post('get-student-applications', [OjtCompaniesController::class, 'getStudentApplicationStatus']);

Route::get('fetch-notifs', [NotifsController::class, 'fetch']);
Route::post('/notifications/mark-as-read', [NotifsController::class, 'markAsRead']);
