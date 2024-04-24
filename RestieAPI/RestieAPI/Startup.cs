using ConfigurationPlaceholders;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using RestieAPI.Config;
using RestieAPI.Configs;
using RestieAPI.Services;
using System.Text;
using System.Text.Json.Serialization;

namespace RestieAPI
{

    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;

        }
        readonly string MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
        public IConfiguration Configuration { get; }
        public void ConfigureServices(IServiceCollection services)
        {
          
            services.AddCors(options =>
            {
                options.AddPolicy(name: MyAllowSpecificOrigins,
                                  builder =>
                                  {
                                      builder.WithOrigins("https://restieapi.fly.dev","https://restie-hardware.vercel.app")
                                      .AllowAnyMethod()
                                      .AllowAnyHeader();
                                  });
            });
            services.InstallServicesInAssembly(Configuration);
            services.AddControllers()
               .AddJsonOptions(options =>
               {
                   options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.Preserve;
               });
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v2", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "Restie API", Version = "v1" });
            });
            services.AddTransient<DatabaseService>();
            services.AddAuthorization();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            var builder = WebApplication.CreateBuilder();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Restie API v1");
                });
                builder
               .AddConfigurationPlaceholders(new InMemoryPlaceholderResolver(new Dictionary<String, String?>
               {
                    { "Database_Config", "Host=ep-patient-star-a1e8nf2e.ap-southeast-1.aws.neon.tech;Port=5432;Database=restie-dev;Username=neondb_owner;Password=z0n3RWaQFKpC;" }
               }));
            }
            else
            {
                var checkLocal = Configuration.GetSection("isLocal").Get<CheckLocal>();
                if (checkLocal.isLocal)
                {
                    builder
                    .AddConfigurationPlaceholders(new InMemoryPlaceholderResolver(new Dictionary<String, String?>
                    {
                            { "Database_Config", "Host=ep-patient-star-a1e8nf2e.ap-southeast-1.aws.neon.tech;Port=5432;Database=restie-dev;Username=neondb_owner;Password=z0n3RWaQFKpC;" }
                    }));
                }else
                {
                    builder
                             .AddConfigurationPlaceholders(new InMemoryPlaceholderResolver(new Dictionary<String, String?>
                             {
                    { "Database_Config", "Host=ep-lively-star-a1yg7u8q.ap-southeast-1.aws.neon.tech;Port=5432;Database=restiedb;Username=restiedb_owner;Password=uvlU6dM5DSmZ;" }
                             }));
                }
          
            }
            app.UseHttpsRedirection();

            app.UseHttpsRedirection();
            app.UseCors(builder => builder
              .WithOrigins("http://localhost:3000", "https://restieapi.fly.dev", "https://restie-hardware.vercel.app")
            .SetIsOriginAllowed(origin => true)
                .AllowAnyHeader()
                .AllowAnyMethod()
            );
            //app.UseStaticFiles(new StaticFileOptions
            //{
            //    FileProvider = new PhysicalFileProvider(Path.Combine(env.ContentRootPath, "Resources/Assets")),
            //    RequestPath = "/Resources/Assets"
            //});
            //app.UseStaticFiles(new StaticFileOptions
            //{
            //    FileProvider = new PhysicalFileProvider(Path.Combine(env.ContentRootPath, "Resources/Images")),
            //    RequestPath = "/Resources/Images"
            //});
            app.UseRouting();
            app.UseAuthentication();
            app.UseAuthorization();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}