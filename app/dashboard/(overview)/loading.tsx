import DashboardSkeleton from '../../ui/skeletons';



/** 
 * 

This action allows the loading.tsx to only apply to the dashboard and not the nested pages (such as the invoice and rhe customer page)

Route groups allow you to organize files into logical groups
 without affecting the URL path structure. When you create a 
 new folder using parentheses (), the name won't be included
  in the URL path. So /dashboard/(overview)/page.tsx becomes /dashboard.

  Here we're using a route group to ensure that the 'laoding.tsx' file only applies to your dashboard overview page. 
  However you can also use route groups to separate your applications into sections (e.g (marketing routes and shop routes) or by teams for larger applications) 
 */




export default function Loading() {
  return <DashboardSkeleton />;
}
