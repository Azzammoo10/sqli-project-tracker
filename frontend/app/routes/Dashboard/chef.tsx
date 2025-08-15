import {Header, ProjectCard, StatsCard} from "../../../components";
import {dahsboardStats,user,allProjects} from "~/constants";
const {totalProjets, totaltachees, projectAded, taskaded, userRole} = dahsboardStats;



const Dashboard = () => {
    return (
        <main className="dashboard wrapper">
            <Header
                title={`Welcome ${user?.name ?? 'Guest '} 👋`}
                description="Suivi centralisé des projets, tâches et utilisateurs en un coup d'œil"
            />
            <section className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full ">
                    <StatsCard
                        headerTitle="Total Project"
                        total={totalProjets}
                        currentMonthCount={projectAded.currentMont}
                        lastMonthCount={projectAded.lassmonth}

                    />
                    <StatsCard
                        headerTitle="Total Tâches"
                        total={totaltachees}
                        currentMonthCount={taskaded.currentMont}
                        lastMonthCount={taskaded.lassmonth}

                    />
                    <StatsCard
                        headerTitle="Tâches aujourd’hui"
                        total={userRole.total}
                        currentMonthCount={userRole.currentMont}
                        lastMonthCount={userRole.lassmonth}

                    />
                </div>
            </section>
            <section className="container">
                <h1 className="text-xl font-semibold text-dark-100">Projets récents</h1>

                <div className="trip-grid">
                    {allProjects.slice(0,4).map(({id, name, imageUrls, clients,tags, status}) => (
                        <ProjectCard
                            key={id}
                            id={id.toString()}
                            name={name}
                            imageUrl={imageUrls[0]}
                            client={clients?.[0]?.client ?? ''}
                            tags={tags}
                            status={status}
                        />
                    ))}
                </div>
            </section>
        </main>
    )
}
export default Dashboard
