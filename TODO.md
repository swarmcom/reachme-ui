# Reach UI TODO

# Bugs

0. productivity report - integer out of range

# On

1. Player functionality for vm, inbound and inqueue records
2. Add skills to queries
3. Help for input fields?
4. Configurable page size for more (now hardcoded as 25)
5. Provide percentages in each report (if they are any)
6. Count how many pages are available for more

# Good to have

3. Make it gzipped for production

# Done

2. Maybe set default range to last 24 hours (if not specified)
2. Update navigation/memoization
5. Dispositions report: by agent, by calls
6. Release state report
1. Cache data and maybe query parameters in reports (to allow navigation back and forth)
4. Combine values with percentages where applicable
1. Allow to hide empty intervals in traffic detail reports
2. Check group_by and range and display a warning if they are not set but required
3. Fix time counter on incoming call on actions like requeue
2. Have a config as a separate file (apart from web-pack)
2. Add transfer_to_uri
3. Add conference buttons
1. Initial project, basic message flow.
2. Provide admin interface to view/edit/delete entites (agents, queues, clients, release codes, whatever)
3. group/profile selector in agent/queue
4. Display incoming call data
