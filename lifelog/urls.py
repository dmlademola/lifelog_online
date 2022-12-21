from django.urls import path, include
from . import views, ajax
import django_eventstream

urlpatterns = [
    path("", views.redirect, name="root"),
    path("signin/", views.signin_process, name="signin"),
    path("signup/", views.signup_process, name="signup"),
    path("home/", views.home, name="home"),
    path("trash/", views.trash, name="trash"),
    path("profile-settings/", views.profile_process, name="profile"),
    path("signout/", views.signout, name="signout"),
    path("admin/", views.admin, name="admin"),
    path("stream/", views.stream, name="stream"),
    # Ajax
    path("ajax/new_event/", ajax.new_event, name="new_event_ajax"),
    path("ajax/pagination/", ajax.pagination, name="pagination_ajax"),
    path("ajax/search/", ajax.search, name="search_ajax"),
    path("ajax/edit_event/", ajax.edit_event, name="edit_event_ajax"),
    path("ajax/trash_event/", ajax.trash_event, name="trash_event_ajax"),
    path("ajax/get_event/", ajax.get_event, name="get_event_ajax"),
    path("ajax/restore_event/", ajax.restore_event, name="restore_event_ajax"),
    path("ajax/delete_event/", ajax.delete_event, name="delete_event_ajax"),
    path("ajax/delete_file/", ajax.delete_file, name="delete_file_ajax"),
    # path("ajax/get_event/<int:event_id>", ajax.edit_event_setup, name="view_event_ajax"),
    # she iyyah mahdi ni
    # path("psw-gen/", views.psw_gen, name="psw_gen"),
    # path("psw-del/<str:id>", views.psw_del, name="psw_del"),
]
