# EventProje

Bu proje, .NET 8 ve Entity Framework Core kullanılarak geliştirilmiş bir etkinlik yönetim sistemidir. Kullanıcılar etkinlikleri listeleyebilir, ekleyebilir ve yöneticiler kullanıcılar ile etkinlikler arasında ilişki kurabilir.

## Proje Amacı

Etkinliklerin API aracılığıyla yönetilebildiği, kullanıcıların etkinlik oluşturabildiği ve her etkinliğin hangi kullanıcı tarafından oluşturulduğunun takip edildiği bir sistem oluşturmaktır.

## Teknolojiler

- ASP.NET Core 8  
- Entity Framework Core  
- SQL Server  
- Postman  

## Yapı

- `Controllers` – API uç noktaları  
- `Models` – Entity sınıfları  
- `Data` – DbContext  
- `Migrations` – EF Core migration dosyaları  
- `docs/DatabaseSchema.png` – Veritabanı şeması  

## Örnek API

- `GET /api/events`  
- `POST /api/events`  
- `GET /api/users`  

## Kurulum

```bash
git clone https://github.com/kCagan/event-proje.git
cd event-proje
dotnet ef database update
dotnet run