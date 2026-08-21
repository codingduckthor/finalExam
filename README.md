# ClinicOS

Веб-система управления клиникой: создание врачей и расписаний, запись пациентов на приём, ведение медицинских карт и просмотр истории приёмов.

## Технологии

- Backend: ASP.NET Core 8, Entity Framework Core, SQL Server LocalDB, JWT, BCrypt.
- Frontend: React, TypeScript, Vite, Axios.

## Роли

- Администратор — создаёт врачей, кабинеты и специальности.
- Врач — настраивает график, ведёт расписание и медицинские карты.
- Регистратор — регистрирует пациентов и записывает их на приём.
- Пациент — самостоятельно регистрируется, выбирает врача и просматривает свои записи и карты.

## Запуск

```powershell
dotnet ef database update --project Exam/Exam.csproj --startup-project Exam/Exam.csproj
dotnet run --project Exam/Exam.csproj
```

В отдельном терминале:

```powershell
cd Exam.Frontend
npm install
npm run dev
```

После создания пустой базы первый администратор создаётся через Swagger: `POST /api/auth/bootstrap-admin`.
