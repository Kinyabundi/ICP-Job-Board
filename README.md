
# ICP Job Board Canister

THis canister provides the core functionality for a job board platform, allowing users to register, find job listings, apply for jobs, and interact with company profiles. It also facilitates communication between job seekers and employers through notifications and ensures data integrity with structured storage.

## Data structure

### User
A type representing user information, including their id, username, email, password, and createdAt.

- UserPayload
A type representing the payload required for user registration, including username, email, and password.

- UserLoginPayload
A type representing the payload required for user login, including email and password.

- CompanyProfile
A type representing company profile information, including id, name, description, website, and createdAt.

- CompanyProfilePayload
A type representing the payload required for creating a company profile, including name, description, and website.

- JobCategory
A type representing job category information, including id and name.

- JobCategoryPayload
A type representing the payload required for creating a job category, including name.

- JobListing
A type representing job listing information, including id, title, description, location, companyId, postedBy, applicants, and category.

- JobListingPayload
A type representing the payload required for creating a job listing, including title, description, location, companyId, postedBy, and category.

- JobApplication
A type representing a user's application to a job listing, including userId and jobId.


# Functions
### User Registration
#### registerUser(payload: UserPayload): Result<User, string>
- Registers a new user with the provided payload.
- Checks if the email is already in use.
- Generates a unique user ID.
- Returns a Result containing the registered user or an error message.
### User Login
#### loginUser(payload: UserLoginPayload): Result<User, string>
- Validates user login credentials.
- Returns a Result containing the user if the credentials are valid or an error message.
### User Profile
#### getUserProfile(userId: string): Result<Opt<User>, string>
- Retrieves a user's profile by their userId.
- Returns a Result containing the user's profile or an indication that the user was not found.
#### getAllUser(): Result<Vec<User>, string>
- Retrieves all user profiles.
- Returns a Result containing a list of user profiles.
### Company Profiles
#### createCompanyProfile(payload: CompanyProfilePayload): Result<CompanyProfile, string>
- Creates a new company profile with the provided payload.
- Generates a unique company ID.
- Returns a Result containing the created company profile.
#### getCompanyProfile(id: string): Result<Opt<CompanyProfile>, string>
- Retrieves a company profile by its id.
- Returns a Result containing the company profile or an error message if not found.
#### getAllCompany(): Result<Vec<CompanyProfile>, string>
- Retrieves all company profiles.
- Returns a Result containing a list of company profiles.
### Job Categories
#### createJobCategory(payload: JobCategoryPayload): Result<JobCategory, string>
- Creates a new job category with the provided payload.
- Generates a unique category ID.
- Returns a Result containing the created job category.
#### getJobCategories(): Result<Vec<JobCategory>, string>
Retrieves all job categories.
Returns a Result containing a list of job categories.
### Job Listings
#### getJobListings(): Result<Vec<JobListing>, string>
- Retrieves all job listings.
- Returns a Result containing a list of job listings.
#### getJobListing(id: string): Result<JobListing, string>
- Retrieves a job listing by its id.
- Returns a Result containing the job listing or an error message if not found.
#### createJobListing(payload: JobListingPayload): Result<JobListing, string>
- Creates a new job listing with the provided payload.
- Generates a unique job listing ID.
- Returns a Result containing the created job listing.
#### deleteJobListing(id: string): Result<JobListing, string>
- Deletes a job listing by its id.
R- eturns a Result containing the deleted job listing or an error message if not found.
### Notifications
#### sendNotification(userId: string, message: string): void
- Sends a notification to a user with the specified userId.
- Updates the user's notifications list.
- sendNotificationsForJobListing(jobListing: JobListing): void
- Sends notifications to users who have preferences matching the job listing category.
#### getUserNotifications(userId: string): Result<Vec<string>, string>
- Retrieves notifications for a user with the specified userId.
- Returns a Result containing a list of notifications or an error message if the user is not found.


## Run Locally

Clone the project

```bash
  git clone https://github.com/Kinyabundi/ICP-Job-Board.git
```

Go to the project directory

```bash
  cd ICP-Job-Board
```

Install dependencies

```bash
  npm install
```

Start the ICP Blockchain Locally and Deploy the Canister

```bash
   dfx start --background --clean
   dfx deploy
```


# Challenges 
- Hashing the password.
- Notification sending to run in the background
- upload CV during job application

# What Next For Job Board
- Include NOtification sending Feature to users when a new Job is listed
- Respond to Job applicants

