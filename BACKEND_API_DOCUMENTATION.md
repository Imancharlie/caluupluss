# Django Backend API Documentation
## Academic Journey Simplified - Backend Endpoints

### Overview
This documentation outlines the Django REST API endpoints needed to make the Academic Journey Simplified application fully functional. The backend will handle student data, course management, and GPA calculations.

---

## 🏗️ **Database Models**

### 1. University Model
```python
class University(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length=200)
    country = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### 2. College Model
```python
class College(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length=200)
    university = models.ForeignKey(University, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### 3. Program Model
```python
class Program(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length=200)
    college = models.ForeignKey(College, on_delete=models.CASCADE)
    duration = models.IntegerField()  # in years
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### 4. Course Model
```python
class Course(models.Model):
    COURSE_TYPES = [
        ('core', 'Core'),
        ('elective', 'Elective'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    code = models.CharField(max_length=20)
    name = models.CharField(max_length=200)
    credits = models.IntegerField()
    type = models.CharField(max_length=10, choices=COURSE_TYPES)
    semester = models.IntegerField()
    year = models.IntegerField()
    program = models.ForeignKey(Program, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### 5. Student Model
```python
class Student(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    university = models.ForeignKey(University, on_delete=models.CASCADE)
    college = models.ForeignKey(College, on_delete=models.CASCADE)
    program = models.ForeignKey(Program, on_delete=models.CASCADE)
    year = models.IntegerField()
    semester = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### 6. StudentCourse Model (Many-to-Many with grades)
```python
class StudentCourse(models.Model):
    GRADE_CHOICES = [
        ('A', 'A'),
        ('B+', 'B+'),
        ('B', 'B'),
        ('C', 'C'),
        ('D', 'D'),
        ('E', 'E'),
        ('F', 'F'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    points = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['student', 'course']
```

---

## 🔗 **API Endpoints**

### **Authentication Endpoints**

#### 1. User Registration
```
POST /api/auth/register/
```
**Request Body:**
```json
{
    "email": "student@example.com",
    "password": "password123",
    "display_name": "John Doe"
}
```
**Response:**
```json
{
    "user": {
        "id": "uuid",
        "email": "student@example.com",
        "display_name": "John Doe"
    },
    "token": "jwt_token_here"
}
```

#### 2. User Login
```
POST /api/auth/login/
```
**Request Body:**
```json
{
    "email": "student@example.com",
    "password": "password123"
}
```
**Response:**
```json
{
    "user": {
        "id": "uuid",
        "email": "student@example.com",
        "display_name": "John Doe"
    },
    "token": "jwt_token_here"
}
```

---

### **University & Academic Structure Endpoints**

#### 3. Get All Universities
```
GET /api/universities/
```
**Response:**
```json
[
    {
        "id": "uuid",
        "name": "University of Technology",
        "country": "Nigeria"
    }
]
```

#### 4. Get Colleges by University
```
GET /api/universities/{university_id}/colleges/
```
**Response:**
```json
[
    {
        "id": "uuid",
        "name": "College of Engineering and Technology",
        "university_id": "uuid"
    }
]
```

#### 5. Get Programs by College
```
GET /api/colleges/{college_id}/programs/
```
**Response:**
```json
[
    {
        "id": "uuid",
        "name": "Bachelor of Science in Computer Science",
        "college_id": "uuid",
        "duration": 4
    }
]
```

#### 6. Get Courses by Program, Year, and Semester
```
GET /api/programs/{program_id}/courses/?year=1&semester=1
```
**Response:**
```json
[
    {
        "id": "uuid",
        "code": "CS101",
        "name": "Introduction to Programming",
        "credits": 3,
        "type": "core",
        "semester": 1,
        "year": 1,
        "program_id": "uuid"
    }
]
```

---

### **Student Management Endpoints**

#### 7. Create/Update Student Profile
```
POST /api/students/profile/
PUT /api/students/profile/
```
**Request Body:**
```json
{
    "university_id": "uuid",
    "college_id": "uuid",
    "program_id": "uuid",
    "year": 1,
    "semester": 1
}
```
**Response:**
```json
{
    "id": "uuid",
    "university": {
        "id": "uuid",
        "name": "University of Technology"
    },
    "college": {
        "id": "uuid",
        "name": "College of Engineering"
    },
    "program": {
        "id": "uuid",
        "name": "Computer Science"
    },
    "year": 1,
    "semester": 1
}
```

#### 8. Get Student Profile
```
GET /api/students/profile/
```
**Response:**
```json
{
    "id": "uuid",
    "university": {
        "id": "uuid",
        "name": "University of Technology"
    },
    "college": {
        "id": "uuid",
        "name": "College of Engineering"
    },
    "program": {
        "id": "uuid",
        "name": "Computer Science"
    },
    "year": 1,
    "semester": 1,
    "courses": [
        {
            "id": "uuid",
            "code": "CS101",
            "name": "Introduction to Programming",
            "credits": 3,
            "type": "core",
            "grade": "A",
            "points": 5.0
        }
    ]
}
```

---

### **Course Management Endpoints**

#### 9. Add Course to Student
```
POST /api/students/courses/
```
**Request Body:**
```json
{
    "course_id": "uuid"
}
```
**Response:**
```json
{
    "message": "Course added successfully",
    "course": {
        "id": "uuid",
        "code": "CS101",
        "name": "Introduction to Programming",
        "credits": 3,
        "type": "core"
    }
}
```

#### 10. Remove Course from Student
```
DELETE /api/students/courses/{course_id}/
```
**Response:**
```json
{
    "message": "Course removed successfully"
}
```

#### 11. Update Course Grade
```
PUT /api/students/courses/{course_id}/grade/
```
**Request Body:**
```json
{
    "grade": "A"
}
```
**Response:**
```json
{
    "message": "Grade updated successfully",
    "course": {
        "id": "uuid",
        "code": "CS101",
        "grade": "A",
        "points": 5.0
    }
}
```

#### 12. Get Student Courses
```
GET /api/students/courses/
```
**Response:**
```json
[
    {
        "id": "uuid",
        "code": "CS101",
        "name": "Introduction to Programming",
        "credits": 3,
        "type": "core",
        "grade": "A",
        "points": 5.0
    }
]
```

---

### **GPA Calculation Endpoints**

#### 13. Calculate Current GPA
```
GET /api/students/gpa/
```
**Response:**
```json
{
    "gpa": 4.25,
    "total_credits": 12,
    "total_points": 51.0,
    "graded_courses": 4,
    "breakdown": [
        {
            "course_code": "CS101",
            "course_name": "Introduction to Programming",
            "credits": 3,
            "grade": "A",
            "points": 5.0,
            "contribution": 15.0
        }
    ]
}
```

#### 14. Generate Target GPA Grades
```
POST /api/students/gpa/target/
```
**Request Body:**
```json
{
    "target_gpa": 4.0
}
```
**Response:**
```json
{
    "message": "Target grades generated successfully",
    "target_gpa": 4.0,
    "actual_gpa": 4.02,
    "accuracy": "excellent",
    "grades": [
        {
            "course_id": "uuid",
            "course_code": "CS101",
            "course_name": "Introduction to Programming",
            "credits": 3,
            "required_grade": "A",
            "required_points": 5.0
        }
    ]
}
```

#### 15. Reset All Grades
```
POST /api/students/gpa/reset/
```
**Response:**
```json
{
    "message": "All grades reset to A",
    "courses_updated": 4
}
```

---

## 🔧 **Django Settings Requirements**

### Required Packages
```python
# requirements.txt
Django==4.2.7
djangorestframework==3.14.0
django-cors-headers==4.3.1
djangorestframework-simplejwt==5.3.0
python-decouple==3.8
```

### Settings Configuration
```python
# settings.py
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'api',  # Your app name
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS settings for frontend
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://yourdomain.com",
]

CORS_ALLOW_CREDENTIALS = True

# JWT Authentication
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
```

---

## 📝 **Frontend Integration Notes**

### Data Flow
1. **Workplace Page**: Uses endpoints 3-8 to load universities, colleges, programs, and courses
2. **GPA Calculator**: Uses endpoints 9-15 to manage courses and calculate GPA
3. **Authentication**: Uses endpoints 1-2 for user login/registration

### Local Storage Mapping
- `studentInfo` → Student Profile API (endpoint 7-8)
- `workplaceCourses` → Student Courses API (endpoint 11-12)
- `courseGrades` → Course Grades API (endpoint 13-15)

### Error Handling
All endpoints should return consistent error responses:
```json
{
    "error": "Error message",
    "code": "ERROR_CODE",
    "details": {}
}
```

---
