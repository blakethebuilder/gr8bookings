SELECT name, type, COALESCE(listRule,'null'), COALESCE(viewRule,'null'), COALESCE(createRule,'null') FROM _collections WHERE name NOT LIKE '_%' ORDER BY name;
