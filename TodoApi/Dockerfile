# שלב 1: בניית הפרויקט
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# העתקת קבצי הפרויקט והתקנת חבילות (NuGet)
COPY *.csproj ./
RUN dotnet restore

# העתקת כל שאר הקבצים ובניית גרסת Release
COPY . .
RUN dotnet publish -c Release -o /app/build

# שלב 2: יצירת תמונת ההרצה (Runtime)
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/build .

# הגדרת הפורט שהאפליקציה תאזין לו
ENV ASPNETCORE_HTTP_PORTS=10000
EXPOSE 10000

# הרצת ה-DLL של הפרויקט שלך (החליפי ב-TodoApi.dll אם שם הקובץ שונה)
ENTRYPOINT ["dotnet", "TodoApi.dll"]