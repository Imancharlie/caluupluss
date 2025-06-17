from django.db import IntegrityError
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token

from django.db.models.functions import TruncMonth
from django.db.models import Count
from .models import College, Program, AcademicYear, Course, Data, CourseConfirmation, CourseFeedback,Feedback
from .serializers import (
    CollegeSerializer, ProgramSerializer, AcademicYearSerializer, CourseSerializer,
    DataSerializer, CourseConfirmationSerializer, CourseFeedbackSerializer,FeedbackSerializer
)
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth import login

import hashlib
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import (
    CourseOverride, CourseSuggestion, GlobalCourseOverride
)
from .serializers import (
    CourseSerializer,    # you already have this
    OverrideSaveSerializer,
)
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
import secrets
import string
from datetime import datetime, timedelta
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from django.urls import reverse
from django.contrib.sites.shortcuts import get_current_site
from dateutil.relativedelta import relativedelta
from django.db.models import Q
import json

# Custom permission class for admin users
class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_staff

@api_view(['POST'])
@permission_classes([AllowAny])
def send_email_to_users(request):
    try:
        subject = request.data.get('subject')
        message = request.data.get('message')
        
        if not subject or not message:
            return Response(
                {'error': 'Subject and message are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get all users
        users = User.objects.all()
        total_users = users.count()
        successful_sends = 0
        failed_sends = 0
        errors = []
        
        print(f"Starting to send emails to {total_users} users")
        
        for user in users:
            try:
                # Send email to each user
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False
                )
                successful_sends += 1
                print(f"Email sent successfully to {user.email}")
                
            except Exception as e:
                failed_sends += 1
                error_msg = f"Failed to send email to {user.email}: {str(e)}"
                errors.append(error_msg)
                print(error_msg)
        
        print(f"Email sending completed. Success: {successful_sends}, Failed: {failed_sends}")
        
        return Response({
            'message': 'Email sending completed',
            'total_users': total_users,
            'successful_sends': successful_sends,
            'failed_sends': failed_sends,
            'errors': errors
        })
        
    except Exception as e:
        print(f"Error in send_email_to_users: {str(e)}")
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Temporarily remove IsAdminUser for testing
def get_admin_dashboard_data(request):
    try:
        # Debug: Check user permissions
        print(f"User: {request.user.username}")
        print(f"Is authenticated: {request.user.is_authenticated}")
        print(f"Is staff: {request.user.is_staff}")
        print(f"Is superuser: {request.user.is_superuser}")
        
        # Temporarily allow any authenticated user for testing
        # if not request.user.is_staff:
        #     return Response(
        #         {'error': 'Access denied. Admin privileges required.'}, 
        #         status=status.HTTP_403_FORBIDDEN
        #     )
        
        # Get counts
        counts = {
            'user_count': User.objects.count(),
            'data_count': Course.objects.count(),
            'program_count': Program.objects.count(),
            'college_count': College.objects.count(),
            'course_count': Course.objects.count(),
            'feedback_count': Feedback.objects.count(),
            'confirmed_count': AcademicYear.objects.filter(is_confirmed=True).count()
        }

        # Get usage data for last 4 months
        four_months_ago = timezone.now() - timedelta(days=120)
        usage_data = User.objects.filter(
            date_joined__gte=four_months_ago
        ).annotate(
            month=TruncMonth('date_joined')
        ).values('month').annotate(
            count=Count('id')
        ).order_by('month')

        # Format usage data for frontend
        usage_data = [
            {
                'month': item['month'].strftime('%B %Y'),
                'count': item['count']
            }
            for item in usage_data
        ]

        # Get programs by college
        programs_by_college = Program.objects.values(
            'college__name'
        ).annotate(
            total=Count('id')
        ).order_by('-total')

        # Get recent activities (last 5 user registrations)
        recent_activities = User.objects.order_by('-date_joined')[:5].values(
            'username', 'email', 'date_joined'
        )

        # Format recent activities
        recent_activities = [
            {
                'action': f'New user registered: {activity["username"]}',
                'time': activity['date_joined'].strftime('%Y-%m-%d %H:%M')
            }
            for activity in recent_activities
        ]

        return Response({
            'counts': counts,
            'usageData': usage_data,
            'dataByYear': [],  # This can be implemented later if needed
            'programsByCollege': list(programs_by_college),
            'recent_activities': recent_activities
        })
    except Exception as e:
        print(f"Admin dashboard error: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
# Store reset tokens temporarily (in production, use Redis or database)
password_reset_tokens = {}

def generate_reset_token():
    """Generate a secure random token"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(32))

@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    """Handle password reset request"""
    try:
        email = request.data.get('email')

        if not email:
            return Response(
                {'error': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(username=email)  # Since we use email as username

            # Generate token
            token = generate_reset_token()

            # Store token with expiration (24 hours)
            password_reset_tokens[token] = {
                'user_id': user.id,
                'expires': timezone.now() + timedelta(hours=24)
            }

            # Create reset link
            reset_link = f"https://caluu.kodin.co.tz/forgot-password?token={token}"

            # Send email using the same configuration as registration
            subject = "Password Reset Request 🔐"
            message = (
                f"Hello {user.first_name or email},\n\n"
                "We received a request to reset your password.\n\n"
                f"Click the link below to reset your password:\n{reset_link}\n\n"
                "This link will expire in 24 hours.\n\n"
                "If you did not request this reset, please ignore this email.\n\n"
                "Best regards,\nKodin Team"
            )

            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False
            )

            return Response({
                'message': 'Password reset instructions have been sent to your email'
            })

        except User.DoesNotExist:
            # Don't reveal if email exists or not for security
            return Response({
                'message': 'If an account exists with this email, you will receive password reset instructions'
            })

    except Exception as e:
        print(f"Password reset error: {str(e)}")  # Add logging
        return Response(
            {'error': 'Failed to process password reset request'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def confirm_password_reset(request):
    # ... rest of your code ...
    """Handle password reset confirmation"""
    token = request.data.get('token')
    new_password = request.data.get('password')

    if not token or not new_password:
        return Response(
            {'error': 'Token and new password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check if token exists and is valid
    token_data = password_reset_tokens.get(token)
    if not token_data:
        return Response(
            {'error': 'Invalid or expired token'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check if token has expired
    if timezone.now() > token_data['expires']:
        del password_reset_tokens[token]  # Clean up expired token
        return Response(
            {'error': 'Token has expired'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(id=token_data['user_id'])

        # Update password
        user.set_password(new_password)
        user.save()

        # Remove used token
        del password_reset_tokens[token]

        return Response({
            'message': 'Password has been reset successfully'
        })

    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to reset password'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
@api_view(['GET'])
@permission_classes([AllowAny])
def get_merged_courses(request, program_id, year):
    """
    Return courses for this program/year in priority:
      1) user's personal override (if authenticated)
      2) global override (crowd-approved)
      3) default Course table
    """
    try:
        program = Program.objects.get(pk=program_id)
        semester = request.query_params.get('semester')

        if not semester:
            return Response({'error': 'Semester parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if user is authenticated
        is_authenticated = request.user.is_authenticated
        if not is_authenticated:
            # For unauthenticated users, only return default courses
            courses = Course.objects.filter(
                academic_year__program=program,
                academic_year__year=year,
                semester=semester
            ).select_related('academic_year', 'academic_year__program')

            source = 'default'
            data = CourseSerializer(courses, many=True).data
            return Response({
                'source': source,
                'courses': data,
                'is_authenticated': False
            })

        # For authenticated users, check overrides
        try:
            # 1) Check personal override
            override = CourseOverride.objects.get(
                user=request.user,
                program=program,
                academic_year=year
            )
            source = 'user'
            data = override.data
            return Response({
                'source': source,
                'courses': data,
                'is_authenticated': True
            })
        except CourseOverride.DoesNotExist:
            # 2) Check global override
            try:
                glob = GlobalCourseOverride.objects.get(
                    program=program,
                    academic_year=year
                )
                source = 'global'
                data = glob.data
                return Response({
                    'source': source,
                    'courses': data,
                    'is_authenticated': True
                })
            except GlobalCourseOverride.DoesNotExist:
                # 3) Return default courses
                courses = Course.objects.filter(
                    academic_year__program=program,
                    academic_year__year=year,
                    semester=semester
                ).select_related('academic_year', 'academic_year__program')

                source = 'default'
                data = CourseSerializer(courses, many=True).data
                return Response({
                    'source': source,
                    'courses': data,
                    'is_authenticated': True
                })

    except Program.DoesNotExist:
        return Response({'error': 'Program not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_course_override(request, program_id, year):
    try:
        program = get_object_or_404(Program, pk=program_id)

        if not request.data or 'data' not in request.data:
            return Response(
                {'error': 'Missing required data field'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = OverrideSaveSerializer(
            data=request.data,
            context={'request': request}
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        threshold = 5
        try:
            serializer.save_override(
                program=program,
                academic_year=year,
                threshold=threshold
            )
            return Response(
                {'status': 'ok', 'message': 'Course override saved successfully'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to save override: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    except Program.DoesNotExist:
        return Response(
            {'error': 'Program not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Unexpected error: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


   # In your Django views
@api_view(['POST'])
@permission_classes([AllowAny])
def submit_feedback(request):
   serializer = FeedbackSerializer(data=request.data)
   if serializer.is_valid():
       serializer.save()
       return Response(serializer.data, status=status.HTTP_201_CREATED)
   return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_feedback(request):
   feedback = Feedback.objects.all().order_by('-created_at')
   serializer = FeedbackSerializer(feedback, many=True)
   return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def api_login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {'error': 'Please provide both username and password'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(username=username, password=password)

    if user:
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff
            }
        })

    return Response(
        {'error': 'Invalid credentials'},
        status=status.HTTP_401_UNAUTHORIZED
    )

# ... rest of your views ...
from django.core.mail import send_mail
from django.conf import settings
from django.urls import reverse
from django.contrib.sites.shortcuts import get_current_site

@api_view(['POST'])
@permission_classes([AllowAny])
def api_register(request):
    try:
        email = request.data.get('email')
        password = request.data.get('password')
        name = request.data.get('name', '').split()

        if not email or not password:
            return Response({'error': 'Please provide email and password'}, status=400)

        first_name = name[0] if name else ''
        last_name = ' '.join(name[1:]) if len(name) > 1 else ''

        try:
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )

            login(request, user)

            # ------------- EMAIL CONFIRMATION --------------------
            current_site = get_current_site(request).domain
            login_url = f"https://{current_site}/login"  # Your frontend login page
            subject = "Welcome to Caluu.kodin 🎉"
            message = (
                f"Hello {first_name or email},\n\n"
                "Your account has been created successfully!\n\n"
                f"Click the link below to login:\nhttps://caluu.kodin.co.tz/selection\n\n"
                "Best regards,\nKodin Team"
            )
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])
            # -----------------------------------------------------

            response_data = {
                'id': user.id,
                'email': user.username,
                'name': f"{user.first_name} {user.last_name}".strip() or user.username,
                'isAdmin': user.is_staff
            }

            return Response(response_data, status=201)

        except IntegrityError:
            return Response({'error': 'A user with this email already exists'}, status=400)

    except Exception as e:
        return Response({'error': str(e)}, status=500)


# Add this view if you want to check if a user is authenticated
@api_view(['GET'])
def check_auth(request):
    if request.user.is_authenticated:
        response_data = {
            'id': request.user.id,
            'email': request.user.username,  # Since we're using username as email
            'name': f"{request.user.first_name} {request.user.last_name}".strip() or request.user.username,
            'isAdmin': request.user.is_staff
        }
        return Response(response_data)
    return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

# Add this view for logging out
@api_view(['POST'])
def api_logout(request):
    from django.contrib.auth import logout
    logout(request)
    return Response({'message': 'Successfully logged out'})

@api_view(['POST'])
@permission_classes([AllowAny])
def add_program(request):
    """
    Endpoint to add a new program to the database and create academic years based on duration.
    """
    try:
        # Deserialize and validate incoming data
        serializer = ProgramSerializer(data=request.data)
        if serializer.is_valid():
            # Save the program
            program = serializer.save()

            # Create academic years based on the program's duration
            duration = program.duration
            for year in range(1, duration + 1):
                AcademicYear.objects.create(program=program, year=year)

            return Response(
                {'message': 'Program and academic years added successfully', 'data': serializer.data},
                status=status.HTTP_201_CREATED
            )
        else:
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
    except Exception as e:
        return Response(
            {'error': f'An error occurred: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
from django.http import JsonResponse

def registration_status(request):
    return JsonResponse({"status": "success"})

@api_view(['POST'])
@permission_classes([AllowAny])
def register_courses(request):
    try:
        # Extract data from request
        program_id = request.data.get('program_id')
        academic_year_id = request.data.get('academic_year_id')
        semester = request.data.get('semester')
        courses = request.data.get('courses', [])
        new_courses = request.data.get('new_courses', [])  # New field for courses to be created

        # Validate required fields
        if not program_id or not academic_year_id or not semester:
            return Response({
                'error': 'Missing required fields: program_id, academic_year_id, or semester'
            }, status=status.HTTP_400_BAD_REQUEST)

        # First, create any new courses if provided
        created_courses = []
        if new_courses:
            for course_data in new_courses:
                # Ensure required fields are included
                course_data['academic_year'] = academic_year_id  # Map academic_year_id for compatibility
                course_data['semester'] = semester  # Set semester
                course_serializer = CourseSerializer(data=course_data)
                if course_serializer.is_valid():
                    course = course_serializer.save()
                    created_courses.append(course.id)
                else:
                    return Response({
                        'error': 'Invalid course data',
                        'details': course_serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)

        # Combine existing course IDs with newly created course IDs
        all_course_ids = courses + created_courses

        # Create the registration with all courses
        registration_data = {
            'program_id': program_id,
            'academic_year_id': academic_year_id,
            'semester': semester,
            'courses': all_course_ids
        }

        serializer = CourseSerializer(data=registration_data)
        if serializer.is_valid():
            registration = serializer.save()
            return Response({
                'message': 'Course registration completed successfully',
                'registration': serializer.data,
                'new_courses_created': len(created_courses)
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
@permission_classes([permissions.AllowAny])
def colleges(request):
    if request.method == 'GET':
        colleges = College.objects.all()
        serializer = CollegeSerializer(colleges, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = CollegeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET', 'POST'])
@permission_classes([permissions.AllowAny])
def academic_years(request):
    if request.method == 'GET':
        # Optional filtering by program_id
        program_id = request.query_params.get('program_id')
        academic_years = AcademicYear.objects.all()
        if program_id:
            academic_years = academic_years.filter(program_id=program_id)

        serializer = AcademicYearSerializer(academic_years, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = AcademicYearSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# # Fetch all colleges
# @api_view(['GET'])
# @permission_classes([permissions.AllowAny])
# def get_colleges(request):
#     colleges = College.objects.all()
#     serializer = CollegeSerializer(colleges, many=True)
#     return Response(serializer.data)

# Fetch programs, optionally filter by college_id
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_programs(request):
    college_id = request.query_params.get('college_id')
    programs = Program.objects.all()
    if college_id:
        programs = programs.filter(college_id=college_id)
    serializer = ProgramSerializer(programs, many=True)
    return Response(serializer.data)

# Fetch academic years, optionally filter by program_id
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_academic_years(request):
    program_id = request.query_params.get('program_id')
    academic_years = AcademicYear.objects.all()
    if program_id:
        academic_years = academic_years.filter(program_id=program_id)
    serializer = AcademicYearSerializer(academic_years, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_courses(request):
    # Extract query parameters
    program_id = request.query_params.get('program_id')
    academic_year_id = request.query_params.get('academic_year_id')
    semester = request.query_params.get('semester')
    optional = request.query_params.get('optional')

    # Start with all courses, optimizing with select_related
    courses = Course.objects.select_related('academic_year__program')

    # Apply filters dynamically
    filters = {}
    if program_id:
        filters['academic_year__program_id'] = program_id
    if academic_year_id:
        filters['academic_year_id'] = academic_year_id
    if semester:
        filters['semester'] = semester
      # Ensure only elective courses are returned
    filters['optional'] = False

    courses = courses.filter(**filters).order_by('code')

    # Serialize and return the response
    serializer = CourseSerializer(courses, many=True)
    return Response(serializer.data)

# In your Django views.py or wherever calculate_gpa_api is defined

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Course, Data # Assuming your models are in the same app

@api_view(['POST'])
@permission_classes([AllowAny])
def calculate_gpa_api(request):
    courses_data = request.data.get('courses', [])
    program_id = request.data.get('program_id')
    academic_year = request.data.get('academic_year')

    # Validate required fields
    if not courses_data:
        return Response({'error': 'No course data provided'}, status=status.HTTP_400_BAD_REQUEST)

    if not program_id:
        return Response({'error': 'Program ID is required'}, status=status.HTTP_400_BAD_REQUEST)

    # Handle academic_year - use current academic year if not provided
    if not academic_year:
        from datetime import datetime
        current_year = datetime.now().year
        current_month = datetime.now().month

        # Determine academic year based on current date
        # Assuming academic year starts in September (month 9)
        if current_month >= 9:
            academic_year = f"{current_year}-{current_year + 1}"
        else:
            academic_year = f"{current_year - 1}-{current_year}"

    total_points = 0
    total_credits = 0
    GRADE_POINTS = {
        'A': 5.0, 'B+': 4.0, 'B': 3.0, 'C': 2.0, 'D': 1.0, 'F': 0.0,
    }

    for course_data in courses_data:
        course_id = course_data.get('id')
        grade = course_data.get('grade')

        # PRIORITIZE credit_hours sent from the frontend
        credit_hours_from_request = course_data.get('credit_hours')

        try:
            # Convert credit_hours to float immediately
            if credit_hours_from_request is not None:
                credit_hours = float(credit_hours_from_request)
            else:
                # Fallback to database only if not provided in request
                course = Course.objects.get(id=course_id)
                credit_hours = float(course.credit_hours)
        except (ValueError, TypeError):
            return Response({'error': f'Invalid credit hours for course {course_id}'}, status=status.HTTP_400_BAD_REQUEST)
        except Course.DoesNotExist:
            return Response({'error': f'Course with id {course_id} does not exist in database'}, status=status.HTTP_400_BAD_REQUEST)

        if credit_hours <= 0:  # Ensure credit hours are positive
            continue  # Skip invalid courses

        grade_point = GRADE_POINTS.get(grade, 0)
        total_points += grade_point * credit_hours
        total_credits += credit_hours

    if total_credits == 0:
        return Response({'error': 'No valid courses with positive credit hours provided for GPA calculation'}, status=status.HTTP_400_BAD_REQUEST)

    gpa = total_points / total_credits
    gpa_truncated = int(gpa * 10) / 10

    try:
        # Save GPA data with all required fields
        Data.objects.create(
            program_id=program_id,
            academic_year=academic_year,
            data={'gpa': gpa_truncated}
        )
    except Exception as e:
        print(f"Error saving GPA data: {e}")
        # Return error response instead of just printing
        return Response({'error': f'Failed to save GPA data: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({
        'gpa': gpa_truncated,
        'total_courses': len(courses_data),
        'total_credits': total_credits,
        'program_id': program_id,
        'academic_year': academic_year
    })

from decimal import Decimal, ROUND_HALF_UP
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

def get_grade_point_from_score(score):
    """
    Calculate grade point from numerical score using interpolation.
    """
    # Grade point ranges based on scores
    grade_points = [
        (75, 100, 4.4, 5.0),
        (70, 74, 3.5, 4.3),
        (60, 69, 2.7, 3.4),
        (50, 59, 2.0, 2.6),
        (45, 49, 1.5, 1.9),
        (0, 44, 0.0, 1.4),
    ]

    for lower, upper, gp_min, gp_max in grade_points:
        if lower <= score <= upper:
            # Interpolate within the range
            return gp_min + ((score - lower) / (upper - lower)) * (gp_max - gp_min)
    return 0.0

@api_view(['POST'])
@permission_classes([AllowAny])
def calculate_gpa_scoring_api(request):
    courses_data = request.data.get('courses', [])
    program_id = request.data.get('program_id')
    academic_year = request.data.get('academic_year')

    if not courses_data:
        return Response({'error': 'No course data provided'}, status=status.HTTP_400_BAD_REQUEST)

    total_points = 0
    total_credits = 0

    for course_data in courses_data:
        course_id = course_data.get('id')
        score = course_data.get('score')  # Use 'score' instead of 'grade'

        # PRIORITIZE credit_hours sent from the frontend
        credit_hours_from_request = course_data.get('credit_hours')

        try:
            # Convert credit_hours to float immediately
            if credit_hours_from_request is not None:
                credit_hours = float(credit_hours_from_request)
            else:
                # Fallback to database only if not provided in request
                course = Course.objects.get(id=course_id)
                credit_hours = float(course.credit_hours)
        except (ValueError, TypeError):
            return Response({'error': f'Invalid credit hours for course {course_id}'}, status=status.HTTP_400_BAD_REQUEST)
        except Course.DoesNotExist:
            return Response({'error': f'Course with id {course_id} does not exist in database'}, status=status.HTTP_400_BAD_REQUEST)

        if credit_hours <= 0:
            continue

        # Get grade point from score using interpolation
        grade_point = get_grade_point_from_score(score)
        total_points += grade_point * credit_hours
        total_credits += credit_hours

    if total_credits == 0:
        return Response({'error': 'No valid courses with positive credit hours provided for GPA calculation'}, status=status.HTTP_400_BAD_REQUEST)

    gpa = total_points / total_credits
    gpa_truncated = int(gpa * 10) / 10  # Truncate to one decimal place

    if request.data.get('save_data', False):
        if program_id and academic_year:
            try:
                Data.objects.create(
                    program_id=program_id,
                    academic_year=academic_year,
                    data={'gpa': gpa_truncated}
                )
            except Exception as e:
                print(f"Error saving GPA data: {e}")

    return Response({'gpa': gpa_truncated})
@api_view(['GET', 'POST'])
@permission_classes([permissions.AllowAny])
def submit_feedback_api(request):
    program_id = request.data.get('program_id')
    academic_year_id = request.data.get('academic_year_id')
    issue = request.data.get('issue_type')
    description = request.data.get('description')

    if not all([program_id, academic_year_id, issue, description]):
        return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

    # Extract academic year from academic year ID
    try:
        academic_year_obj = AcademicYear.objects.get(id=academic_year_id)
        academic_year = academic_year_obj.year  # or whatever field contains the actual year
    except AcademicYear.DoesNotExist:
        return Response({'error': 'Invalid academic year ID'}, status=status.HTTP_400_BAD_REQUEST)

    CourseFeedback.objects.create(
        program_id=program_id,
        academic_year=academic_year,
        issue=issue,
        description=description
    )

    return Response({'status': 'success'}, status=status.HTTP_201_CREATED)

# API for login
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def api_login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Please provide both username and password'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=username, password=password)

    if user:
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user_id': user.id, 'username': user.username, 'is_staff': user.is_staff})

    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# API for dashboard statistics
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats_api(request):
    stats = {
        'data_count': Data.objects.count(),
        'program_count': Program.objects.count(),
        'confirmed_count': AcademicYear.objects.filter(courses_confirmed=True).count(),
        'course_count': Course.objects.count(),
        'feedback_count': CourseFeedback.objects.count(),
        'college_count': College.objects.count(),
    }
    return Response(stats)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def select_electives_api(request):
    # Extract query parameters
    program_id = request.query_params.get('program_id')
    academic_year_id = request.query_params.get('academic_year_id')
    semester = request.query_params.get('semester')
    optional = request.query_params.get('optional')

    # Start with all courses, optimizing with select_related
    courses = Course.objects.select_related('academic_year__program')

    # Apply filters dynamically
    filters = {}
    if program_id:
        filters['academic_year__program_id'] = program_id
    if academic_year_id:
        filters['academic_year_id'] = academic_year_id
    if semester:
        filters['semester'] = semester

    # Ensure only elective courses are returned
    filters['optional'] = True

    # Apply filters and order by code
    courses = courses.filter(**filters).order_by('code')

    # Serialize and return the response
    serializer = CourseSerializer(courses, many=True)
    return Response(serializer.data)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework import status
from .models import BlogPost, Comment
from .serializers import BlogPostSerializer, CommentSerializer


# Blog Post List and Create
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def blog_post_list_create(request):
    if request.method == 'GET':
        posts = BlogPost.objects.all()
        serializer = BlogPostSerializer(posts, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = BlogPostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Blog Post Detail, Update, Delete
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticatedOrReadOnly])
def blog_post_detail(request, slug):
    try:
        post = BlogPost.objects.get(slug=slug)
    except BlogPost.DoesNotExist:
        return Response({"error": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = BlogPostSerializer(post)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = BlogPostSerializer(post, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        post.delete()
        return Response({"message": "Post deleted successfully."}, status=status.HTTP_204_NO_CONTENT)


# Comments List and Create
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def comment_list_create(request, slug):
    try:
        post = BlogPost.objects.get(slug=slug)
    except BlogPost.DoesNotExist:
        return Response({"error": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        comments = post.comments.all()
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(post=post, author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Like or Unlike Post (toggle)
@api_view(['POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def like_post(request, slug):
    try:
        post = BlogPost.objects.get(slug=slug)
    except BlogPost.DoesNotExist:
        return Response({"error": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.user in post.likes.all():
        post.likes.remove(request.user)
        liked = False
    else:
        post.likes.add(request.user)
        liked = True

    return Response({
        "liked": liked,
        "like_count": post.likes.count()
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_count(request):
    try:
        count = User.objects.count()
        return Response({
            'count': count
        })
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )