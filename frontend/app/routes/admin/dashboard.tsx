import {Header, ProjectCard, StatsCard} from "../../../components";

const Dashboard = () => {
    const user = {name: "AZZAM"}
    const dahsboardStats = {
        totalProjets: 400,
        projectAded: {currentMont:15, lassmonth:10},
        totaltachees: 10,
        taskaded:{currentMont:10, lassmonth:10},
        userRole: {total: 10,currentMont:10, lassmonth:107}
    }

    const {totalProjets, totaltachees, projectAded, taskaded, userRole} = dahsboardStats;
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

            <ProjectCard />
        </main>
    )
}
export default Dashboard
