from django.contrib import admin
from .models import Report, ReportTemplate, ReportShare


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'estimate', 'report_type', 'format', 'download_count', 'generated_at')
    list_filter = ('report_type', 'format', 'is_public', 'generated_at')
    search_fields = ('title', 'description', 'user__email')
    readonly_fields = ('download_count', 'generated_at', 'file_size')


@admin.register(ReportTemplate)
class ReportTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'template_type', 'format', 'is_active', 'created_at')
    list_filter = ('template_type', 'format', 'is_active')
    search_fields = ('name', 'description')


@admin.register(ReportShare)
class ReportShareAdmin(admin.ModelAdmin):
    list_display = ('report', 'shared_with_email', 'shared_with_name', 'is_active', 'expires_at', 'created_by', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('report__title', 'shared_with_email', 'shared_with_name')
    readonly_fields = ('access_token', 'created_at')



