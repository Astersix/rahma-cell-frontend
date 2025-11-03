import MainLayout from '../layouts/MainLayout'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

const HomePage = () => {
	return (
		<MainLayout>
			<div className="space-y-8">
				<h1 className="text-2xl font-bold">Home Page</h1>

				<section className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<Card>
						<h2 className="mb-4 text-lg font-semibold">Buttons</h2>
						<div className="flex flex-wrap items-center gap-3">
							<Button variant="dark" size="sm">Dark sm</Button>
							<Button variant="dark" size="md">Dark md</Button>
							<Button variant="dark" size="lg">Dark lg</Button>
							<Button variant="light" size="sm">Light sm</Button>
							<Button variant="light" size="md">Light md</Button>
							<Button variant="light" size="lg">Light lg</Button>
							<div className="w-full">
								<Button variant="dark" size="md" fullWidth>
									Full width (dark)
								</Button>
							</div>
						</div>
					</Card>

					<Card>
						<h2 className="mb-4 text-lg font-semibold">Inputs</h2>
						<div className="space-y-4">
							<Input label="Alamat Email" placeholder="Masukkan alamat email Anda" />
							<Input
								label="Alamat Email"
								placeholder="Masukkan alamat email Anda"
								variant="error"
								helperText="Email tidak valid"
							/>
						</div>
					</Card>
				</section>
			</div>
		</MainLayout>
	)
}

export default HomePage

