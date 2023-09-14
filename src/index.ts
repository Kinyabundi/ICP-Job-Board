
import { $query, $update, Record, StableBTreeMap, Vec, match, Result, nat64, ic, Opt } from 'azle';
import { v4 as uuidv4 } from 'uuid';
// import { argon2 } from 'ic-crypto-password';
// import * as crypto from 'crypto';

type User = Record<{
    id: string;
    username: string;
    email: string;
    password: string;
    // salt: string;
    createdAt: nat64;
}>
type UserPayload = Record<{
    username: string;
    email: string;
    password: string;
}>
type UserLoginPayload = Record<{
    email: string;
    password: string;
}>
type CompanyProfile = Record<{
    id: string;
    name: string;
    description: string;
    website: string;
    createdAt: nat64;
}>
type CompanyProfilePayload = Record<{
    name: string;
    description: string;
    website: string;
}>

type JobCategory = Record<{
    id: string;
    name: string;
}>
type JobCategoryPayload = Record<{
    name: string;
}>

type JobListing = Record<{
    id: string;
    title: string;
    description: string;
    location: string;
    companyId: string;
    postedBy: string; // Company id
    applicants: Vec<string>; // List of user IDs who applied
    category: string; // Job category ID
}>

type JobListingPayload = Record<{
    title: string;
    description: string;
    location: string;
    companyId: string;
    postedBy: string; // Company Name
    category: string; // Job category ID
}>
type JobApplication = Record<{
    userId: string;
    jobId: string;
}>
const userStorage = new StableBTreeMap<string, User>(0, 44, 1024);
const companyStorage = new StableBTreeMap<string, CompanyProfile>(1, 44, 1024);
 const jobCategoryStorage = new StableBTreeMap<string, JobCategory>(2, 44, 1024);
const jobListingStorage = new StableBTreeMap<string, JobListing>(3, 44, 1024);

// User Registration
$update;
export function registerUser(payload:UserPayload): Result<User, string> {
    const existingUser = userStorage.values().find(user => user.email === payload.email);
    if (existingUser) {
        return Result.Err<User, string>('Email already in use');
    }
   const userId = uuidv4({ random: [...Array(16)].map(() => Math.floor(Math.random() * 256)) });
    const user: User = {
        id: userId,
        createdAt: ic.time(),
        username: payload.username,
        email: payload.email,
        password: payload.password,
    };
    userStorage.insert(userId, user);
    return Result.Ok(user);
}


$update;
export function loginUser(payload: UserLoginPayload): Result<User, string> {
    const user = userStorage.values().find(u => u.email === payload.email && u.password === payload.password);
    if (user) {
        return Result.Ok(user);
    } else {
        return Result.Err<User, string>('Invalid email or password');
    }
}

$query;
export function getUserProfile(userId: string): Result<Opt<User>, string> {
    const userOpt = userStorage.get(userId);
    if (userOpt.Some) {
        const user = userOpt.Some;
        return Result.Ok(Opt.Some(user));
    } else {
        return Result.Ok(Opt.None);
    }
}

//get all user
$query;
export function getAllUser(): Result<Vec<User>, string> {
    return Result.Ok(userStorage.values());
}


// Company Profiles
$update;
export function createCompanyProfile(payload: CompanyProfilePayload): Result<CompanyProfile, string> {
  const companyId = uuidv4({ random: [...Array(16)].map(() => Math.floor(Math.random() * 256)) });
    const company: CompanyProfile = { 
        id: companyId,
         name: payload.name,
        description: payload.description,
        website: payload.website,
        createdAt: ic.time()
     };
    companyStorage.insert(companyId, company);
    return Result.Ok(company);
}

$query;
export function getCompanyProfile(id: string): Result<Opt<CompanyProfile>, string> {
    const company = companyStorage.get(id);
    if (company) {
        return Result.Ok(company);
    } else {
        return Result.Err<Opt<CompanyProfile>, string>('Company not found');
    }
}

//Job Categories
$update;
export function createJobCategory(payload:JobCategoryPayload): Result<JobCategory, string> {
    const categoryId = uuidv4({ random: [...Array(16)].map(() => Math.floor(Math.random() * 256)) });
    const category: JobCategory = { id: categoryId, name: payload.name };
    jobCategoryStorage.insert(categoryId, category);
    return Result.Ok(category);
}

$query;
export function getJobCategories(): Result<Vec<JobCategory>, string> {
    return Result.Ok(jobCategoryStorage.values());
}

// Job Listings
$query;
export function getJobListings(): Result<Vec<JobListing>, string> {
    return Result.Ok(jobListingStorage.values());
}

$query;
export function getJobListing(id: string): Result<JobListing, string> {
    return match(jobListingStorage.get(id), {
        Some: (jobListing) => Result.Ok<JobListing, string>(jobListing),
        None: () => Result.Err<JobListing, string>(`A job listing with id=${id} not found`)
    });
}

$update;
export function createJobListing(payload: JobListingPayload): Result<JobListing, string> {
    const jobListing: JobListing = { id: uuidv4({ random: [...Array(16)].map(() => Math.floor(Math.random() * 256)) }), applicants: [], ...payload };
    jobListingStorage.insert(jobListing.id, jobListing);
    return Result.Ok(jobListing);
}

export function sendNotification(userId: string, message: string): void {
    const user = userStorage.get(userId);
    if (user) {
        //@ts-ignore
        if (!user.notifications) {
            //@ts-ignore
            user.notifications = []; // Initialize notifications if it doesn't exist
        }
        //@ts-ignore
        user.notifications.push(message);
        //@ts-ignore
        userStorage.insert(userId, user);
    }
}

function sendNotificationsForJobListing(jobListing: JobListing): void {
    const userIds = userStorage.keys();
    userIds.forEach(userId => {
        const user = userStorage.get(userId);
        //@ts-ignore
        if (user && user.categoryPreferences && user.categoryPreferences.includes(jobListing.category)) {
            const notification = `New job listing: ${jobListing.title} in ${jobListing.category}`;
            sendNotification(userId, notification);
        }
    });
}

$update;
export function applyToJobListing(payload: JobApplication): Result<JobListing, string> {
    return match(jobListingStorage.get(payload.jobId), {
        Some: (jobListing) => {
            if (jobListing.applicants.includes(payload.userId)) {
                return Result.Err<JobListing, string>(`You have already applied to this job`);
            }

            const updatedApplicants = [...jobListing.applicants, payload.userId];
            const updatedJobListing: JobListing = { ...jobListing, applicants: updatedApplicants };
            jobListingStorage.insert(jobListing.id, updatedJobListing);
            return Result.Ok<JobListing, string>(updatedJobListing);
        },
        None: () => Result.Err<JobListing, string>(`Job listing with id=${payload.jobId} not found`)
    });
}


// Retrieve user notifications
$query;

export function getUserNotifications(userId: string): Result<Vec<string>, string> {
    const user = userStorage.get(userId);
    if (user) {
        //@ts-ignore
        if (!user.notifications) {
            //@ts-ignore
            user.notifications = []; 
        }//@ts-ignore
        //@ts-ignore
        return Result.Ok(user.notifications);
    } else {
        return Result.Err<string[], string>('User not found');
    }
}