using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
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
                        builder.WithOrigins("https://restieapi.fly.dev", "https://restie-hardware.vercel.app")
                            .SetIsOriginAllowed(origin => true)
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
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Restie API v1");
                });
            }
            app.UseHttpsRedirection();
            //app.UseCors(builder => builder
            //  .WithOrigins("http://localhost:3000", "https://restieapi.fly.dev", "https://restie-hardware.vercel.app")
            //    .SetIsOriginAllowed(origin => true)
            //    .AllowAnyHeader()
            //    .AllowAnyMethod()
            //);
            app.UseCors(MyAllowSpecificOrigins); // Use the configured CORS policy
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