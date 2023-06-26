import React, { Component, lazy, Suspense } from 'react'
import PropTypes from 'prop-types'
import { useRoutes, BrowserRouter, Routes, Route, Link } from 'react-router-dom'

// https://dev.to/mondal10/react-router-lazy-load-route-components-4df

export function LazyLoadRoute (element) {
	// const LazyElement = lazy(() => import(`/src/pages/${element}.js`))
	console.log(element)
	const lazyPath = `../../pages/${element}.js`
	console.log(lazyPath)
	const LazyElement = lazy(() => import(lazyPath.toLowerCase()))
	console.log(LazyElement)
	const newElement = (
		<Suspense fallback="Loading...">
			<LazyElement />
		</Suspense>
	)
	console.log(newElement)
	return newElement
}

export function LazyLoadElements (props) {
	console.log('LazyLoadElements')
	const elements = props.routes.map((thisRoute) => {
		console.log(thisRoute.element)
		const lazyPath = `.${__dirname}pages/${thisRoute.element}.js`
		console.log(lazyPath)
		const LazyElement = lazy(() => import(lazyPath.toLowerCase()))
		console.log(LazyElement)
		const newElement = (
			<Suspense fallback="Loading...">
				<LazyElement />
			</Suspense>
		)
		console.log(newElement)
		return newElement
	})
	return elements
}

export function LazyRouterElement (props) {
	const routes = props.routes.map((thisRoute) => ({
		path: thisRoute.path,
		element: LazyLoadRoute(thisRoute.element)
	}))
	return useRoutes(routes)
}

export function RouterElement (props) {
	console.log(props.routes)
	const newroutes = props.routes.map((thisRoute) => {
		// const NewElement = thisRoute.element;
		// console.log(NewElement)
		const newLazyElement = {
			path: thisRoute.path,
			element: LazyLoadRoute(thisRoute.element) // <NewElement />
		}
		console.log(newLazyElement)
		return newLazyElement
	})
	console.log(newroutes)
	return useRoutes(newroutes)
}
RouterElement.propTypes = {
	routes: PropTypes.array.isRequired
}

export function RouterElement_v3 (props) {
	// <RouterElement routes={this.props.routes} />
	const newroutes = useRoutes(props.routes)
	return newroutes
}

export class RouterElement_v2 extends Component {
	// <RouterElement routes={this.props.routes} />
	static propTypes = {
		routes: PropTypes.array.isRequired
	}

	render () {
		const newroutes = useRoutes(this.props.routes)
		return (
			<BrowserRouter>
				<Routes>
					{newroutes}
				</Routes>
			</BrowserRouter>
		)
	}
}

export class RouterElement_v1 extends Component {
	// <RouterElement routes={this.props.routes} />
	static propTypes = {
		routes: PropTypes.array.isRequired
	}

	render () {
		const newroutes = this.props.routes.map((thisRoute, i) => {
			const ThisElement = thisRoute.element
			return (<Route key={i + '-' + thisRoute.element} path={`${thisRoute.path}`} element={React.createElement(ThisElement)} />)
		})
		return (
			<BrowserRouter>
				<Routes>
					{newroutes}
				</Routes>
			</BrowserRouter>
		)
	}
}

export function LinkElement (props) {
	const links = props.routes.map((thisRoute, i) => (
		<Link key={i + '-' + thisRoute.element} to={thisRoute.path}>{thisRoute.element}</Link>
	))
	return links
}
