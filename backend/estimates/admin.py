from django.contrib import admin
from .models import Estimate, EstimateItem, EstimateRevision, EstimateShare


class EstimateItemInline(admin.TabularInline):
    model = EstimateItem
    extra = 0
    readonly_fields = ('total_price',)


class EstimateRevisionInline(admin.TabularInline):
    model = EstimateRevision
    extra = 0
    readonly_fields = ('created_at',)


@admin.register(Estimate)
class EstimateAdmin(admin.ModelAdmin):
    list_display = ('project_name', 'user', 'project_type', 'location', 'total_estimated_cost', 'status', 'created_at')
    list_filter = ('status', 'project_type', 'location', 'created_at')
    search_fields = ('project_name', 'project_description', 'user__email')
    readonly_fields = ('total_estimated_cost', 'adjusted_cost_per_sqm', 'contingency_amount')
    inlines = [EstimateItemInline, EstimateRevisionInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'project_name', 'project_description', 'status')
        }),
        ('Project Details', {
            'fields': ('project_type', 'location', 'project_template', 'total_area')
        }),
        ('Cost Calculations', {
            'fields': ('base_cost_per_sqm', 'location_multiplier', 'adjusted_cost_per_sqm', 'total_estimated_cost')
        }),
        ('Contingency', {
            'fields': ('contingency_percentage', 'contingency_amount')
        }),
        ('Metadata', {
            'fields': ('is_public', 'created_at', 'updated_at')
        }),
    )


@admin.register(EstimateItem)
class EstimateItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'estimate', 'category', 'quantity', 'unit', 'unit_price', 'total_price')
    list_filter = ('category', 'estimate__project_type', 'estimate__location')
    search_fields = ('name', 'description', 'estimate__project_name')
    readonly_fields = ('total_price',)


@admin.register(EstimateRevision)
class EstimateRevisionAdmin(admin.ModelAdmin):
    list_display = ('estimate', 'revision_number', 'previous_total_cost', 'new_total_cost', 'created_by', 'created_at')
    list_filter = ('created_at', 'estimate__project_type')
    search_fields = ('estimate__project_name', 'changes_summary')
    readonly_fields = ('created_at',)


@admin.register(EstimateShare)
class EstimateShareAdmin(admin.ModelAdmin):
    list_display = ('estimate', 'shared_with_email', 'shared_with_name', 'is_active', 'expires_at', 'created_by', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('estimate__project_name', 'shared_with_email', 'shared_with_name')
    readonly_fields = ('access_token', 'created_at')



